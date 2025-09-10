package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.entities.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = :activityType ORDER BY ua.createdAt DESC")
    List<UserActivity> findByUserAndActivityType(@Param("user") User user, @Param("activityType") String activityType);

    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = 'module_view'")
    Long countModuleViewsByUser(@Param("user") User user);

    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = 'module_complete'")
    Long countModuleCompletionsByUser(@Param("user") User user);

    @Query("SELECT SUM(ua.timeSpent) FROM UserActivity ua WHERE ua.user = :user AND ua.timeSpent IS NOT NULL")
    Long sumTimeSpentByUser(@Param("user") User user);

    @Query("SELECT AVG(ua.timeSpent) FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = 'session_end' AND ua.timeSpent IS NOT NULL")
    Double findAverageSessionTimeByUser(@Param("user") User user);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user = :user ORDER BY ua.createdAt DESC LIMIT 1")
    UserActivity findLastActivityByUser(@Param("user") User user);

    @Query("SELECT ua.category, COUNT(ua) FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = 'module_view' AND ua.category IS NOT NULL GROUP BY ua.category ORDER BY COUNT(ua) DESC")
    List<Object[]> findFavoriteCategoriesByUser(@Param("user") User user);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user = :user AND ua.createdAt BETWEEN :startDate AND :endDate ORDER BY ua.createdAt DESC")
    List<UserActivity> findByUserAndCreatedAtBetween(@Param("user") User user, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT CAST(ua.createdAt AS date) as date, COUNT(ua) as count FROM UserActivity ua WHERE ua.user = :user AND ua.activityType = 'module_view' AND ua.createdAt BETWEEN :startDate AND :endDate GROUP BY CAST(ua.createdAt AS date) ORDER BY date")
    List<Object[]> findWeeklyActivityByUser(@Param("user") User user, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
}
