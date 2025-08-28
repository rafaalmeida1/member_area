package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.module.CreateModuleRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.module.UpdateModuleRequest;
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
            modules = moduleRepository.findByCreatedByOrderByCreatedAtDesc(user, pageable);
        } else {
            // Para pacientes, buscar módulos visíveis
            modules = moduleRepository.findVisibleModulesForUser(user.getId(), pageable);
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
        } else {
            // Para pacientes, buscar módulos visíveis
            modules = moduleRepository.findVisibleToPatient(user);
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
        
        // Validar se o usuário é profissional
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem criar módulos");
        }

        // Criar módulo
        Module module = new Module();
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setCoverImage(request.getCoverImage());
        module.setCategory(request.getCategory());
        module.setCreatedBy(user);
        module.setVisibility(request.getVisibility());
        
        // Configurar pacientes específicos se necessário
        if (request.getVisibility() == ContentVisibility.SPECIFIC && request.getAllowedPatientIds() != null) {
            Set<User> allowedPatients = userRepository.findAllById(request.getAllowedPatientIds())
                    .stream()
                    .filter(u -> u.getRole().equals(Role.PATIENT))
                    .collect(Collectors.toSet());
            module.setAllowedPatients(allowedPatients);
        }

        // Salvar módulo primeiro
        module = moduleRepository.save(module);

        // Processar e salvar content blocks
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
        
        module.setContent(contentBlocks);
        module = moduleRepository.save(module);
        
        log.info("Módulo criado com sucesso: {}", module.getId());
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
        
        // Atualizar pacientes específicos se necessário
        if (request.getVisibility() == ContentVisibility.SPECIFIC && request.getAllowedPatientIds() != null) {
            Set<User> allowedPatients = userRepository.findAllById(request.getAllowedPatientIds())
                    .stream()
                    .filter(u -> u.getRole().equals(Role.PATIENT))
                    .collect(Collectors.toSet());
            module.setAllowedPatients(allowedPatients);
        } else {
            module.setAllowedPatients(new HashSet<>());
        }

        // Atualizar conteúdo
        List<ContentBlock> contentBlocks = request.getContent().stream()
                .map(contentDto -> {
                    ContentBlock block = new ContentBlock();
                    block.setType(contentDto.getType());
                    block.setContent(contentDto.getContent());
                    block.setOrderIndex(contentDto.getOrder());
                    return block;
                })
                .collect(Collectors.toList());
        
        module.setContent(contentBlocks);

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
        
        log.info("Módulo atualizado com sucesso: {}", module.getId());
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
}