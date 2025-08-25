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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Page<ModuleSummaryResponse> getModules(String category, String search, Pageable pageable) {
        // Obter usuário atual do contexto de segurança
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Page<Module> modules;
        
        // PROFISSIONAL vê todos os módulos
        if (currentUser.getRole() == Role.PROFESSIONAL) {
            if (category != null) {
                modules = moduleRepository.findByCategory(category, pageable);
            } else {
                modules = moduleRepository.findAll(pageable);
            }
        } 
        // PACIENTE vê apenas módulos GENERAL + SPECIFIC para ele
        else {
            if (category != null) {
                modules = moduleRepository.findByCategoryVisibleToPatient(category, currentUser, pageable);
            } else {
                modules = moduleRepository.findVisibleToPatient(currentUser, pageable);
            }
        }
        
        return modules.map(moduleMapper::toModuleSummaryResponse);
    }

    public ModuleResponse getModuleById(UUID moduleId) {

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));

        return moduleMapper.toModuleResponse(module);
    }

    @Transactional
    public ModuleResponse createModule(CreateModuleRequest request, User user) {

        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais e administradores podem criar módulos");
        }

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .category(request.getCategory())
                .createdBy(user)
                .build();

        module = moduleRepository.save(module);

        // Create content blocks
        List<ContentBlock> contentBlocks = new ArrayList<>();
        for (CreateModuleRequest.ContentBlockData contentData : request.getContent()) {
            ContentBlock contentBlock = ContentBlock.builder()
                    .module(module)
                    .type(contentData.getType())
                    .content(contentData.getContent())
                    .orderIndex(contentData.getOrder())
                    .build();
            contentBlocks.add(contentBlock);
        }

        module.setContent(contentBlocks);
        module = moduleRepository.save(module);

        // Notificar pacientes sobre novo módulo
        if (module.getVisibility() == ContentVisibility.GENERAL) {
            List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
            for (User patient : patients) {
                notificationService.notifyNewModule(patient, module.getTitle(), module.getId().getMostSignificantBits());
            }
        }

        return moduleMapper.toModuleResponse(module);
    }

    @Transactional
    public ModuleResponse updateModule(UUID moduleId, UpdateModuleRequest request, User user) {

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));

        if (!user.getRole().equals(Role.PROFESSIONAL) && !module.getCreatedBy().getId().equals(user.getId())) {
            throw new BusinessException("Apenas o criador do módulo ou administradores podem editá-lo");
        }

        if (request.getTitle() != null) {
            module.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            module.setDescription(request.getDescription());
        }
        if (request.getCoverImage() != null) {
            module.setCoverImage(request.getCoverImage());
        }
        if (request.getCategory() != null) {
            module.setCategory(request.getCategory());
        }

        if (request.getContent() != null) {
            Map<Integer, ContentBlock> existingContentMap = module.getContent().stream()
                    .collect(Collectors.toMap(ContentBlock::getOrderIndex, Function.identity()));

            List<ContentBlock> newContentList = new ArrayList<>();

            for (UpdateModuleRequest.ContentBlockUpdateData contentData : request.getContent()) {
                ContentBlock existingBlock = existingContentMap.get(contentData.getOrder());
                if (existingBlock != null) {
                    existingBlock.setType(contentData.getType());
                    existingBlock.setContent(contentData.getContent());
                    newContentList.add(existingBlock);
                    existingContentMap.remove(contentData.getOrder());
                } else {
                    // Create new block
                    ContentBlock newBlock = ContentBlock.builder()
                            .module(module)
                            .type(contentData.getType())
                            .content(contentData.getContent())
                            .orderIndex(contentData.getOrder())
                            .build();
                    newContentList.add(newBlock);
                }
            }

            module.getContent().clear();
            module.getContent().addAll(newContentList);
        }

        Module updatedModule = moduleRepository.save(module);

        return moduleMapper.toModuleResponse(updatedModule);
    }

    @Transactional
    public void deleteModule(UUID moduleId, User user) {

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Módulo não encontrado"));

        // Check permissions: owner or admin
        if (!user.getRole().equals(Role.PROFESSIONAL) && !module.getCreatedBy().getId().equals(user.getId())) {
            throw new BusinessException("Apenas o criador do módulo ou administradores podem excluí-lo");
        }

        moduleRepository.delete(module);

    }

    public List<String> getCategories() {
        return moduleRepository.findDistinctCategories();
    }
}