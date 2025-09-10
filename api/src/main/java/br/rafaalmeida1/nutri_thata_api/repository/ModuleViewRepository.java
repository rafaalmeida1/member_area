package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.entities.ModuleView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ModuleViewRepository extends JpaRepository<ModuleView, Long> {

    List<ModuleView> findByUserOrderByViewedAtDesc(User user);

    @Query("SELECT mv FROM ModuleView mv WHERE mv.user = :user AND mv.moduleId = :moduleId")
    List<ModuleView> findByUserAndModuleId(@Param("user") User user, @Param("moduleId") Long moduleId);

    @Query("SELECT COUNT(mv) FROM ModuleView mv WHERE mv.user = :user")
    Long countByUser(@Param("user") User user);

    @Query("SELECT COUNT(mv) FROM ModuleView mv WHERE mv.user = :user AND mv.isCompleted = true")
    Long countCompletedByUser(@Param("user") User user);

    @Query("SELECT SUM(mv.timeSpent) FROM ModuleView mv WHERE mv.user = :user")
    Long sumTimeSpentByUser(@Param("user") User user);

    @Query("SELECT mv.category, COUNT(mv) FROM ModuleView mv WHERE mv.user = :user AND mv.category IS NOT NULL GROUP BY mv.category ORDER BY COUNT(mv) DESC")
    List<Object[]> findCategoriesByUser(@Param("user") User user);

    @Query("SELECT mv FROM ModuleView mv WHERE mv.user = :user AND mv.viewedAt BETWEEN :startDate AND :endDate ORDER BY mv.viewedAt DESC")
    List<ModuleView> findByUserAndViewedAtBetween(@Param("user") User user, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT mv FROM ModuleView mv WHERE mv.user = :user AND mv.category = :category ORDER BY mv.viewedAt DESC")
    List<ModuleView> findByUserAndCategory(@Param("user") User user, @Param("category") String category);
}
