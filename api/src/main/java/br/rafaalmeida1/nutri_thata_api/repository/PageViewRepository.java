package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.PageView;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PageViewRepository extends JpaRepository<PageView, Long> {

    Long countByProfessionalProfile(ProfessionalProfile professionalProfile);

    @Query("SELECT COUNT(DISTINCT pv.ipAddress) FROM PageView pv WHERE pv.professionalProfile = :profile")
    Long countUniqueViewsByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT AVG(pv.sessionDuration) FROM PageView pv WHERE pv.professionalProfile = :profile AND pv.sessionDuration IS NOT NULL")
    Double findAverageSessionDurationByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT pv FROM PageView pv WHERE pv.professionalProfile = :profile AND pv.viewedAt BETWEEN :startDate AND :endDate ORDER BY pv.viewedAt DESC")
    List<PageView> findByProfessionalProfileAndViewedAtBetween(@Param("profile") ProfessionalProfile professionalProfile, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pv FROM PageView pv WHERE pv.user = :user ORDER BY pv.viewedAt DESC")
    List<PageView> findByUser(@Param("user") User user);

    @Query("SELECT COUNT(pv) FROM PageView pv WHERE pv.user = :user AND pv.professionalProfile = :profile")
    Long countByUserAndProfessionalProfile(@Param("user") User user, @Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT DATE(pv.viewedAt) as date, COUNT(pv) as views, COUNT(DISTINCT pv.ipAddress) as uniqueViews " +
           "FROM PageView pv WHERE pv.professionalProfile = :profile AND pv.viewedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(pv.viewedAt) ORDER BY date")
    List<Object[]> findViewsByDateForProfile(@Param("profile") ProfessionalProfile professionalProfile, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pv.country, COUNT(pv) FROM PageView pv WHERE pv.professionalProfile = :profile GROUP BY pv.country ORDER BY COUNT(pv) DESC")
    List<Object[]> findViewsByCountryForProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT pv.deviceType, COUNT(pv) FROM PageView pv WHERE pv.professionalProfile = :profile GROUP BY pv.deviceType ORDER BY COUNT(pv) DESC")
    List<Object[]> findViewsByDeviceForProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT pv.browser, COUNT(pv) FROM PageView pv WHERE pv.professionalProfile = :profile GROUP BY pv.browser ORDER BY COUNT(pv) DESC")
    List<Object[]> findViewsByBrowserForProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT pv.user.id, pv.user.name, pv.user.email, COUNT(pv) as totalViews, MAX(pv.viewedAt) as lastViewAt " +
           "FROM PageView pv WHERE pv.professionalProfile = :profile AND pv.user IS NOT NULL " +
           "GROUP BY pv.user.id, pv.user.name, pv.user.email ORDER BY totalViews DESC")
    List<Object[]> findAuthenticatedUsersByProfile(@Param("profile") ProfessionalProfile professionalProfile);
}
