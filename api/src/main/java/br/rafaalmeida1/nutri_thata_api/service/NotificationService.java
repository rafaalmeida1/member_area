package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.NotificationType;
import br.rafaalmeida1.nutri_thata_api.mapper.NotificationMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    /**
     * Cria uma nova notificação
     */
    @Transactional
    public void createNotification(User user, NotificationType type, String title, String message, String moduleId, String moduleTitle) {
        try {
            Notification notification = Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .message(message)
                    .moduleId(moduleId)
                    .moduleTitle(moduleTitle)
                    .is_read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
            log.info("Notificação criada para usuário {}: {}", user.getId(), title);
        } catch (Exception e) {
            log.error("Erro ao criar notificação para usuário {}: {}", user.getId(), e.getMessage(), e);
        }
    }

    /**
     * Cria notificação simples sem módulo
     */
    @Transactional
    public void createNotification(User user, NotificationType type, String title, String message) {
        createNotification(user, type, title, message, null, null);
    }

    /**
     * Cria notificação para todos os pacientes de um profissional
     */
    @Transactional
    public void createNotificationForAllPatients(User professional, NotificationType type, String title, String message, String moduleId, String moduleTitle) {
        List<User> patients = notificationRepository.findPatientsByProfessional(professional);
        
        for (User patient : patients) {
            createNotification(patient, type, title, message, moduleId, moduleTitle);
        }
        
        log.info("Notificações criadas para {} pacientes do profissional {}", patients.size(), professional.getId());
    }

    /**
     * Notifica sobre novo módulo criado
     */
    @Transactional
    public void notifyNewModule(User professional, String moduleId, String moduleTitle) {
        String title = "Novo Conteúdo Disponível! 📚";
        String message = String.format("Um novo módulo '%s' foi adicionado à sua jornada nutricional.", moduleTitle);
        
        createNotificationForAllPatients(professional, NotificationType.MODULE_NEW, title, message, moduleId, moduleTitle);
    }

    /**
     * Notifica sobre módulo atualizado
     */
    @Transactional
    public void notifyModuleUpdated(User professional, String moduleId, String moduleTitle) {
        String title = "Conteúdo Atualizado! ✨";
        String message = String.format("O módulo '%s' foi atualizado com novas informações.", moduleTitle);
        
        createNotificationForAllPatients(professional, NotificationType.MODULE_UPDATED, title, message, moduleId, moduleTitle);
    }

    /**
     * Notifica sobre novo paciente cadastrado
     */
    @Transactional
    public void notifyNewPatient(User professional, String patientName) {
        String title = "Novo Paciente Cadastrado! 👋";
        String message = String.format("%s aceitou seu convite e agora faz parte da sua prática.", patientName);
        
        createNotification(professional, NotificationType.PATIENT_REGISTERED, title, message);
    }

    /**
     * Notifica sobre convite aceito
     */
    @Transactional
    public void notifyInviteAccepted(User professional, String patientName, String patientEmail) {
        String title = "Convite Aceito! 🎉";
        String message = String.format("%s (%s) aceitou seu convite e está pronto para começar a jornada nutricional.", patientName, patientEmail);
        
        createNotification(professional, NotificationType.INVITE_ACCEPTED, title, message);
    }

    /**
     * Notifica sobre atividade do paciente
     */
    @Transactional
    public void notifyPatientActivity(User professional, String patientName, String activityDescription) {
        String title = "Atividade do Paciente 📈";
        String message = String.format("%s %s", patientName, activityDescription);
        
        createNotification(professional, NotificationType.PATIENT_ACTIVITY, title, message);
    }

    /**
     * Notifica sobre módulo concluído pelo paciente
     */
    @Transactional
    public void notifyModuleCompleted(User professional, String patientName, String moduleTitle) {
        String title = "Módulo Concluído! ✅";
        String message = String.format("%s concluiu o módulo '%s'.", patientName, moduleTitle);
        
        createNotification(professional, NotificationType.MODULE_COMPLETED, title, message);
    }

    /**
     * Notifica sobre lembrete de consulta
     */
    @Transactional
    public void notifyAppointmentReminder(User user, String appointmentDetails) {
        String title = "Lembrete de Consulta 📅";
        String message = String.format("Você tem uma consulta agendada: %s", appointmentDetails);
        
        createNotification(user, NotificationType.APPOINTMENT_REMINDER, title, message);
    }

    /**
     * Notifica sobre sistema
     */
    @Transactional
    public void notifySystemMessage(User user, String title, String message) {
        createNotification(user, NotificationType.SYSTEM, title, message);
    }

    /**
     * Busca notificações do usuário (últimas 10 não lidas + 5 lidas)
     */
    public List<NotificationResponse> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findRecentNotificationsByUser(user);
        return notificationMapper.toNotificationResponseList(notifications);
    }

    /**
     * Busca apenas notificações não lidas
     */
    public List<NotificationResponse> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository.findUnreadByUserOrderByCreatedAtDesc(user);
        return notificationMapper.toNotificationResponseList(notifications);
    }

    /**
     * Busca todas as notificações paginadas
     */
    public Page<NotificationResponse> getAllNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(notificationMapper::toNotificationResponse);
    }

    /**
     * Conta notificações não lidas
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    /**
     * Marca notificação como lida
     */
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdAndUser(notificationId, user)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        
        notification.setIs_read(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * Marca todas as notificações como lidas
     */
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadByUser(user);
        
        for (Notification notification : unreadNotifications) {
            notification.setIs_read(true);
            notification.setReadAt(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Remove notificações antigas (mais de 30 dias)
     */
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deletedCount = notificationRepository.deleteOldNotifications(cutoffDate);
        log.info("Limpeza de notificações: {} notificações antigas removidas", deletedCount);
    }
}