package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.entities.UserCategoryProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCategoryProgressRepository extends JpaRepository<UserCategoryProgress, Long> {

    List<UserCategoryProgress> findByUserOrderByLastActivityDesc(User user);

    Optional<UserCategoryProgress> findByUserAndCategory(User user, String category);

    @Query("SELECT ucp FROM UserCategoryProgress ucp WHERE ucp.user = :user ORDER BY ucp.totalTimeSpent DESC")
    List<UserCategoryProgress> findByUserOrderByTotalTimeSpentDesc(@Param("user") User user);

    @Query("SELECT ucp FROM UserCategoryProgress ucp WHERE ucp.user = :user ORDER BY ucp.modulesViewed DESC")
    List<UserCategoryProgress> findByUserOrderByModulesViewedDesc(@Param("user") User user);

    @Query("SELECT SUM(ucp.modulesViewed) FROM UserCategoryProgress ucp WHERE ucp.user = :user")
    Long sumModulesViewedByUser(@Param("user") User user);

    @Query("SELECT SUM(ucp.modulesCompleted) FROM UserCategoryProgress ucp WHERE ucp.user = :user")
    Long sumModulesCompletedByUser(@Param("user") User user);

    @Query("SELECT SUM(ucp.totalTimeSpent) FROM UserCategoryProgress ucp WHERE ucp.user = :user")
    Long sumTotalTimeSpentByUser(@Param("user") User user);
}
