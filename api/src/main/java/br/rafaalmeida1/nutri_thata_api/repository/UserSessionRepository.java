package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.entities.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findBySessionId(String sessionId);

    List<UserSession> findByUserOrderByStartTimeDesc(User user);

    @Query("SELECT us FROM UserSession us WHERE us.user = :user AND us.isActive = true ORDER BY us.startTime DESC")
    List<UserSession> findActiveSessionsByUser(@Param("user") User user);

    @Query("SELECT us FROM UserSession us WHERE us.user = :user AND us.startTime BETWEEN :startDate AND :endDate ORDER BY us.startTime DESC")
    List<UserSession> findByUserAndStartTimeBetween(@Param("user") User user, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(us.totalTimeSpent) FROM UserSession us WHERE us.user = :user AND us.endTime IS NOT NULL")
    Double findAverageSessionDurationByUser(@Param("user") User user);

    @Query("SELECT COUNT(us) FROM UserSession us WHERE us.user = :user")
    Long countSessionsByUser(@Param("user") User user);

    @Query("SELECT SUM(us.totalTimeSpent) FROM UserSession us WHERE us.user = :user")
    Long sumTotalTimeSpentByUser(@Param("user") User user);
}
