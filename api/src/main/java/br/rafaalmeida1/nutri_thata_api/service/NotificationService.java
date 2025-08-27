package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.NotificationType;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.NotificationMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationMapper notificationMapper;
    
    public List<NotificationResponse> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notificationMapper.toResponseList(notifications);
    }
    
    public List<NotificationResponse> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false);
        return notificationMapper.toResponseList(notifications);
    }
    
    public Page<NotificationResponse> getAllNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(notificationMapper::toResponse);
    }
    
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndRead(user, false);
    }
    
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.markAsReadByIdAndUser(notificationId, user);
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUser(user);
    }
    
    @Transactional
    public void createNotification(User user, NotificationType type, String title, String message) {
        Notification notification = new Notification(user, type, title, message);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void createModuleNotification(User user, NotificationType type, String title, String message, Long moduleId, String moduleTitle) {
        Notification notification = new Notification(user, type, title, message, moduleId, moduleTitle);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void notifyNewModule(User user, String moduleTitle, Long moduleId) {
        createModuleNotification(
            user,
            NotificationType.MODULE_NEW,
            "Novo Módulo Disponível",
            "Um novo módulo foi criado: " + moduleTitle,
            moduleId,
            moduleTitle
        );
    }
    
    @Transactional
    public void notifyModuleUpdate(User user, String moduleTitle, Long moduleId) {
        createModuleNotification(
            user,
            NotificationType.MODULE_UPDATED,
            "Módulo Atualizado",
            "O módulo foi atualizado: " + moduleTitle,
            moduleId,
            moduleTitle
        );
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