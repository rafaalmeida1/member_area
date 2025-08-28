package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.NotificationType;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.NotificationMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.NotificationRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ModuleRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import br.rafaalmeida1.nutri_thata_api.entities.Module;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;
    private final NotificationMapper notificationMapper;
    private final CacheService cacheService;

    public List<NotificationResponse> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notificationMapper.toResponseList(notifications);
    }

    @Cacheable(value = "notifications", key = "#user.id + '_unread'")
    public List<NotificationResponse> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "notifications", key = "#user.id + '_all'")
    public Page<NotificationResponse> getAllNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(notificationMapper::toResponse);
    }

    @Cacheable(value = "notifications", key = "#user.id + '_count'")
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notificação não encontrada"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Você não tem permissão para marcar esta notificação como lida");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_all'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndReadFalse(user);
        
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_all'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void createNotification(User user, NotificationType type, String title, String message) {
        Notification notification = new Notification(user, type, title, message);
        notificationRepository.save(notification);
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_all'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void createModuleNotification(User user, String moduleTitle, UUID moduleId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(NotificationType.MODULE_NEW)
                .title("Novo Módulo Disponível")
                .message("Um novo módulo foi adicionado: " + moduleTitle)
                .moduleId(moduleId)
                .moduleTitle(moduleTitle)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_all'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void notifyNewModule(Module module) {
        if (module.getVisibility() == ContentVisibility.GENERAL) {
            // Notificar todos os pacientes ativos
            List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
            for (User patient : patients) {
                createModuleNotification(patient, module.getTitle(), module.getId());
            }
        } else if (module.getVisibility() == ContentVisibility.SPECIFIC) {
            // Notificar apenas pacientes específicos
            for (User patient : module.getAllowedPatients()) {
                createModuleNotification(patient, module.getTitle(), module.getId());
            }
        }
    }

    @Caching(evict = {
        @CacheEvict(value = "notifications", key = "#user.id + '_unread'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_all'"),
        @CacheEvict(value = "notifications", key = "#user.id + '_count'"),
        @CacheEvict(value = "notifications", allEntries = true)
    })
    public void notifyModuleUpdate(Module module) {
        if (module.getVisibility() == ContentVisibility.GENERAL) {
            // Notificar todos os pacientes ativos
            List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
            for (User patient : patients) {
                Notification notification = Notification.builder()
                        .user(patient)
                        .type(NotificationType.MODULE_UPDATED)
                        .title("Módulo Atualizado")
                        .message("O módulo '" + module.getTitle() + "' foi atualizado")
                        .moduleId(module.getId())
                        .moduleTitle(module.getTitle())
                        .read(false)
                        .build();

                notificationRepository.save(notification);
            }
        } else if (module.getVisibility() == ContentVisibility.SPECIFIC) {
            // Notificar apenas pacientes específicos
            for (User patient : module.getAllowedPatients()) {
                Notification notification = Notification.builder()
                        .user(patient)
                        .type(NotificationType.MODULE_UPDATED)
                        .title("Módulo Atualizado")
                        .message("O módulo '" + module.getTitle() + "' foi atualizado")
                        .moduleId(module.getId())
                        .moduleTitle(module.getTitle())
                        .read(false)
                        .build();

                notificationRepository.save(notification);
            }
        }
    }
    
    @Transactional
    public void notifyProfessionalMessage(User user, String message) {
        createNotification(
            user,
            NotificationType.PROFESSIONAL_MESSAGE,
            "Mensagem do Profissional",
            message
        );
    }
    
    @Transactional
    public void notifySystem(User user, String title, String message) {
        createNotification(
            user,
            NotificationType.SYSTEM,
            title,
            message
        );
    }
} 