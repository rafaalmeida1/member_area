package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Busca notificações recentes do usuário (10 não lidas + 5 lidas mais recentes)
     */
    @Query("""
        (SELECT n FROM Notification n WHERE n.user = :user AND n.read = false ORDER BY n.createdAt DESC LIMIT 10)
        UNION ALL
        (SELECT n FROM Notification n WHERE n.user = :user AND n.read = true ORDER BY n.createdAt DESC LIMIT 5)
    """)
    List<Notification> findRecentNotificationsByUser(@Param("user") User user);

    /**
     * Busca todas as notificações não lidas do usuário
     */
    List<Notification> findUnreadByUserOrderByCreatedAtDesc(User user);

    /**
     * Busca todas as notificações não lidas do usuário (para atualização)
     */
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.read = false")
    List<Notification> findUnreadByUser(@Param("user") User user);

    /**
     * Busca todas as notificações do usuário ordenadas por data
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Conta notificações não lidas do usuário
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.read = false")
    long countUnreadByUser(@Param("user") User user);

    /**
     * Busca notificação por ID e usuário
     */
    Optional<Notification> findByIdAndUser(Long id, User user);

    /**
     * Busca pacientes de um profissional (para envio de notificações)
     */
    @Query("""
        SELECT DISTINCT u FROM User u 
        JOIN Invite i ON i.email = u.email 
        WHERE i.createdBy = :professional AND u.role = 'PATIENT' AND u.isActive = true
    """)
    List<User> findPatientsByProfessional(@Param("professional") User professional);

    /**
     * Remove notificações antigas
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Busca últimas notificações não lidas por tipo
     */
    @Query("""
        SELECT n FROM Notification n 
        WHERE n.user = :user AND n.type = :type AND n.read = false 
        ORDER BY n.createdAt DESC
    """)
    List<Notification> findUnreadByUserAndType(@Param("user") User user, @Param("type") String type);
}