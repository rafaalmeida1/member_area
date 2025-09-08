package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.module.CreateModuleRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.module.UpdateModuleRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.module.ModuleReorderRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleSummaryResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ContentBlock;
import br.rafaalmeida1.nutri_thata_api.entities.Module;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.ModuleMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.ModuleRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;
import br.rafaalmeida1.nutri_thata_api.repositories.ContentBlockRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final ModuleMapper moduleMapper;
    private final FileCleanupService fileCleanupService;
    private final CacheService cacheService;
    private final NotificationService notificationService;
    private final ContentBlockRepository contentBlockRepository;

    public Page<ModuleResponse> getModules(User user, Pageable pageable) {
        log.info("Buscando módulos para usuário: {} (role: {})", user.getEmail(), user.getRole());
        
        Page<Module> modules;
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            // Para profissionais, buscar todos os módulos criados por eles ordenados por ordem
            modules = moduleRepository.findByCreatedByOrderByOrderIndexAsc(user, pageable);
            log.info("Profissional vendo {} módulos criados por ele", modules.getTotalElements());
        } else {
            // Para pacientes, buscar módulos visíveis (GENERAL + SPECIFIC para ele) ordenados por ordem
            modules = moduleRepository.findVisibleModulesForUser(user.getId(), pageable);
            log.info("Paciente vendo {} módulos visíveis", modules.getTotalElements());
        }
        
        return modules.map(moduleMapper::toModuleResponse);
    }

    @Cacheable(value = "modules", key = "#user.id + '_all'")
    public List<ModuleResponse> getCachedModules(User user) {
        log.info("Buscando módulos em cache para usuário: {} (role: {})", user.getEmail(), user.getRole());
        
        List<Module> modules;
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            // Para profissionais, buscar todos os módulos criados por eles
            modules = moduleRepository.findByCreatedBy(user);
            log.info("Profissional vendo {} módulos em cache", modules.size());
        } else {
            // Para pacientes, buscar módulos visíveis (GENERAL + SPECIFIC para ele)
            modules = moduleRepository.findVisibleToPatient(user);
            log.info("Paciente vendo {} módulos visíveis em cache", modules.size());
        }
        
        return modules.stream()
                .map(moduleMapper::toModuleResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "modules", key = "#id")
    public ModuleResponse getModuleById(String id) {
        log.info("Buscando módulo por ID: {}", id);
        
        Module module = moduleRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));
        
        return moduleMapper.toModuleResponse(module);
    }

    @Caching(evict = {
        @CacheEvict(value = "modules", key = "#user.id + '_all'"),
        @CacheEvict(value = "modules", key = "#user.id + '_categories'"),
        @CacheEvict(value = "modules", allEntries = true)
    })
    public ModuleResponse createModule(User user, CreateModuleRequest request) {
        log.info("Criando novo módulo para usuário: {}", user.getEmail());
        
        // Determinar a ordem do novo módulo
        Integer newOrderIndex = 0;
        if (request.getOrderIndex() != null) {
            newOrderIndex = request.getOrderIndex();
        } else {
            // Se não especificado, colocar no final
            List<Module> existingModules = moduleRepository.findByCreatedByOrderByOrderIndexAsc(user);
            if (!existingModules.isEmpty()) {
                newOrderIndex = existingModules.get(existingModules.size() - 1).getOrderIndex() + 1;
            }
        }
        
        log.info("Criando módulo com ordem: {}", newOrderIndex);

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .category(request.getCategory())
                .orderIndex(newOrderIndex)
                .visibility(request.getVisibility() != null ? request.getVisibility() : ContentVisibility.GENERAL)
                .createdBy(user)
                .content(new ArrayList<>())
                .allowedPatients(new HashSet<>())
                .build();

        // Configurar pacientes específicos se necessário
        if (request.getVisibility() == ContentVisibility.SPECIFIC && request.getAllowedPatientIds() != null) {
            Set<User> allowedPatients = userRepository.findAllById(request.getAllowedPatientIds())
                    .stream()
                    .filter(u -> u.getRole().equals(Role.PATIENT))
                    .collect(Collectors.toSet());
            module.setAllowedPatients(allowedPatients);
        }

        module = moduleRepository.save(module);

        // Criar content blocks
        List<ContentBlock> contentBlocks = new ArrayList<>();
        for (var contentDto : request.getContent()) {
            ContentBlock block = new ContentBlock();
            block.setType(contentDto.getType());
            block.setContent(contentDto.getContent());
            block.setOrderIndex(contentDto.getOrder());
            block.setModule(module);
            contentBlocks.add(block);
        }
        
        // Salvar content blocks
        contentBlocks = contentBlocks.stream()
                .map(block -> contentBlockRepository.save(block))
                .collect(Collectors.toList());
        
        // Adicionar content blocks ao módulo
        module.getContent().addAll(contentBlocks);
        module = moduleRepository.save(module);

        // Criar notificação para pacientes se o módulo for visível
        if (module.getVisibility() == ContentVisibility.GENERAL) {
            // Notificar todos os pacientes do profissional
            notificationService.notifyNewModule(user, module.getId().toString(), module.getTitle());
        } else if (module.getVisibility() == ContentVisibility.SPECIFIC && !module.getAllowedPatients().isEmpty()) {
            // Notificar apenas pacientes específicos
            for (User patient : module.getAllowedPatients()) {
                notificationService.createNotification(
                    patient, 
                    br.rafaalmeida1.nutri_thata_api.enums.NotificationType.MODULE_NEW,
                    "Novo Conteúdo Disponível! 📚",
                    String.format("Um novo módulo '%s' foi adicionado à sua jornada nutricional.", module.getTitle()),
                    module.getId().toString(),
                    module.getTitle()
                );
            }
        }

        log.info("Módulo criado com sucesso: {} (ordem: {})", module.getId(), module.getOrderIndex());
        return moduleMapper.toModuleResponse(module);
    }

    @Caching(evict = {
        @CacheEvict(value = "modules", key = "#id"),
        @CacheEvict(value = "modules", key = "#user.id + '_all'"),
        @CacheEvict(value = "modules", key = "#user.id + '_categories'"),
        @CacheEvict(value = "modules", allEntries = true)
    })
    public ModuleResponse updateModule(String id, User user, UpdateModuleRequest request) {
        log.info("Atualizando módulo: {} para usuário: {}", id, user.getEmail());
        log.info("Request data: title={}, visibility={}, allowedPatientIds={}", 
                request.getTitle(), request.getVisibility(), request.getAllowedPatientIds());
        
        Module module = moduleRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));

        // Validar permissão
        if (!module.getCreatedBy().getId().equals(user.getId())) {
            throw new BusinessException("Você não tem permissão para editar este módulo");
        }

        // Guardar dados antigos para limpeza de arquivos
        String oldCoverImage = module.getCoverImage();
        List<String> oldContentFiles = module.getContent().stream()
                .filter(block -> block.getContent() != null && block.getContent().contains("/static/"))
                .map(ContentBlock::getContent)
                .collect(Collectors.toList());

        // Atualizar dados básicos
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setCoverImage(request.getCoverImage());
        module.setCategory(request.getCategory());
        module.setVisibility(request.getVisibility());
        
        // Atualizar ordem se fornecida
        if (request.getOrderIndex() != null) {
            module.setOrderIndex(request.getOrderIndex());
            log.info("Ordem atualizada para: {}", request.getOrderIndex());
        }
        
        log.info("Dados básicos atualizados: visibility={}", module.getVisibility());
        
        // Atualizar pacientes específicos se necessário
        if (request.getVisibility() == ContentVisibility.SPECIFIC && request.getAllowedPatientIds() != null) {
            log.info("Configurando pacientes específicos: {}", request.getAllowedPatientIds());
            Set<User> allowedPatients = userRepository.findAllById(request.getAllowedPatientIds())
                    .stream()
                    .filter(u -> u.getRole().equals(Role.PATIENT))
                    .collect(Collectors.toSet());
            module.setAllowedPatients(allowedPatients);
            log.info("Pacientes específicos configurados: {}", 
                    allowedPatients.stream().map(User::getName).collect(Collectors.toList()));
        } else {
            log.info("Limpando pacientes específicos (visibilidade: {})", request.getVisibility());
            module.setAllowedPatients(new HashSet<>());
        }

        // Limpar content blocks antigos de forma segura
        if (module.getContent() != null) {
            log.info("Limpando {} content blocks antigos", module.getContent().size());
            // Deletar os content blocks do banco primeiro
            contentBlockRepository.deleteByModule(module);
            // Limpar a lista no módulo
            module.getContent().clear();
        }
        
        // Criar novos content blocks
        List<ContentBlock> contentBlocks = new ArrayList<>();
        for (var contentDto : request.getContent()) {
            ContentBlock block = new ContentBlock();
            block.setType(contentDto.getType());
            block.setContent(contentDto.getContent());
            block.setOrderIndex(contentDto.getOrder());
            block.setModule(module);
            contentBlocks.add(block);
        }
        
        log.info("Criando {} novos content blocks", contentBlocks.size());
        
        // Salvar content blocks
        contentBlocks = contentBlocks.stream()
                .map(block -> contentBlockRepository.save(block))
                .collect(Collectors.toList());
        
        // Atualizar a lista de content blocks no módulo
        module.getContent().addAll(contentBlocks);

        log.info("Salvando módulo com visibilidade: {}", module.getVisibility());
        module = moduleRepository.save(module);

        // Limpar arquivos antigos
        if (oldCoverImage != null && !oldCoverImage.equals(request.getCoverImage())) {
            fileCleanupService.deleteByPublicUrl(oldCoverImage);
        }
        
        for (String oldFile : oldContentFiles) {
            if (!request.getContent().stream().anyMatch(c -> oldFile.equals(c.getContent()))) {
                fileCleanupService.deleteByPublicUrl(oldFile);
            }
        }
        
        // Criar notificação sobre atualização do módulo
        if (module.getVisibility() == ContentVisibility.GENERAL) {
            // Notificar todos os pacientes do profissional
            notificationService.notifyModuleUpdated(user, module.getId().toString(), module.getTitle());
        } else if (module.getVisibility() == ContentVisibility.SPECIFIC && !module.getAllowedPatients().isEmpty()) {
            // Notificar apenas pacientes específicos
            for (User patient : module.getAllowedPatients()) {
                notificationService.createNotification(
                    patient, 
                    br.rafaalmeida1.nutri_thata_api.enums.NotificationType.MODULE_UPDATED,
                    "Conteúdo Atualizado! ✨",
                    String.format("O módulo '%s' foi atualizado com novas informações.", module.getTitle()),
                    module.getId().toString(),
                    module.getTitle()
                );
            }
        }

        log.info("Módulo atualizado com sucesso: {} (visibilidade: {})", module.getId(), module.getVisibility());
        return moduleMapper.toModuleResponse(module);
    }

    @Caching(evict = {
        @CacheEvict(value = "modules", key = "#id"),
        @CacheEvict(value = "modules", key = "#user.id + '_all'"),
        @CacheEvict(value = "modules", key = "#user.id + '_categories'"),
        @CacheEvict(value = "modules", allEntries = true)
    })
    public void deleteModule(String id, User user) {
        log.info("Deletando módulo: {} por usuário: {}", id, user.getEmail());
        
        Module module = moduleRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));

        // Validar permissão
        if (!module.getCreatedBy().getId().equals(user.getId())) {
            throw new BusinessException("Você não tem permissão para deletar este módulo");
        }

        // Limpar arquivos associados
        if (module.getCoverImage() != null && !module.getCoverImage().isBlank()) {
            fileCleanupService.deleteByPublicUrl(module.getCoverImage());
        }
        
        if (module.getContent() != null) {
            for (ContentBlock block : module.getContent()) {
                if (block.getContent() != null && block.getContent().contains("/static/")) {
                    fileCleanupService.deleteByPublicUrl(block.getContent());
                }
            }
        }

        moduleRepository.delete(module);
        log.info("Módulo deletado com sucesso: {}", id);
    }

    @Cacheable(value = "modules", key = "#user.id + '_categories'")
    public List<String> getCategories(User user) {
        log.info("Buscando categorias para usuário: {}", user.getEmail());
        
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            return moduleRepository.findDistinctCategoriesByCreatedBy(user);
        } else {
            return moduleRepository.findDistinctCategoriesForUser(user.getId());
        }
    }

    @Caching(evict = {
        @CacheEvict(value = "modules", key = "#user.id + '_all'"),
        @CacheEvict(value = "modules", allEntries = true)
    })
    public List<ModuleResponse> reorderModules(User user, List<ModuleReorderRequest> reorderRequests) {
        log.info("Reordenando {} módulos para usuário: {}", reorderRequests.size(), user.getEmail());
        
        List<ModuleResponse> reorderedModules = new ArrayList<>();
        
        for (ModuleReorderRequest request : reorderRequests) {
            Module module = moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new NotFoundException("Módulo não encontrado: " + request.getModuleId()));
            
            // Validar permissão
            if (!module.getCreatedBy().getId().equals(user.getId())) {
                throw new BusinessException("Você não tem permissão para reordenar este módulo");
            }
            
            // Atualizar ordem
            module.setOrderIndex(request.getNewOrderIndex());
            module = moduleRepository.save(module);
            
            reorderedModules.add(moduleMapper.toModuleResponse(module));
            log.info("Módulo {} reordenado para posição {}", module.getId(), request.getNewOrderIndex());
        }
        
        log.info("Reordenação concluída com sucesso");
        return reorderedModules;
    }
}