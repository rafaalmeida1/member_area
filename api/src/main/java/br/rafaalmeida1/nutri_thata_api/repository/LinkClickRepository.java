package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.LinkClick;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalLink;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LinkClickRepository extends JpaRepository<LinkClick, Long> {

    Long countByProfessionalLink(ProfessionalLink professionalLink);

    @Query("SELECT COUNT(DISTINCT lc.ipAddress) FROM LinkClick lc WHERE lc.professionalLink = :link")
    Long countUniqueClicksByProfessionalLink(@Param("link") ProfessionalLink professionalLink);

    @Query("SELECT COUNT(lc) FROM LinkClick lc WHERE lc.professionalLink.professionalProfile = :profile")
    Long countByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT COUNT(DISTINCT lc.ipAddress) FROM LinkClick lc WHERE lc.professionalLink.professionalProfile = :profile")
    Long countUniqueClicksByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT lc FROM LinkClick lc WHERE lc.professionalLink = :link AND lc.clickedAt BETWEEN :startDate AND :endDate ORDER BY lc.clickedAt DESC")
    List<LinkClick> findByProfessionalLinkAndClickedAtBetween(@Param("link") ProfessionalLink professionalLink, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT lc FROM LinkClick lc WHERE lc.professionalLink.professionalProfile = :profile AND lc.clickedAt BETWEEN :startDate AND :endDate ORDER BY lc.clickedAt DESC")
    List<LinkClick> findByProfessionalProfileAndClickedAtBetween(@Param("profile") ProfessionalProfile professionalProfile, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT lc FROM LinkClick lc WHERE lc.user = :user ORDER BY lc.clickedAt DESC")
    List<LinkClick> findByUser(@Param("user") User user);

    @Query("SELECT COUNT(lc) FROM LinkClick lc WHERE lc.user = :user AND lc.professionalLink.professionalProfile = :profile")
    Long countByUserAndProfessionalProfile(@Param("user") User user, @Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT DATE(lc.clickedAt) as date, COUNT(lc) as clicks, COUNT(DISTINCT lc.ipAddress) as uniqueClicks " +
           "FROM LinkClick lc WHERE lc.professionalLink = :link AND lc.clickedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(lc.clickedAt) ORDER BY date")
    List<Object[]> findClicksByDateForLink(@Param("link") ProfessionalLink professionalLink, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT lc.country, COUNT(lc) FROM LinkClick lc WHERE lc.professionalLink = :link GROUP BY lc.country ORDER BY COUNT(lc) DESC")
    List<Object[]> findClicksByCountryForLink(@Param("link") ProfessionalLink professionalLink);

    @Query("SELECT lc.deviceType, COUNT(lc) FROM LinkClick lc WHERE lc.professionalLink = :link GROUP BY lc.deviceType ORDER BY COUNT(lc) DESC")
    List<Object[]> findClicksByDeviceForLink(@Param("link") ProfessionalLink professionalLink);

    @Query("SELECT lc.browser, COUNT(lc) FROM LinkClick lc WHERE lc.professionalLink = :link GROUP BY lc.browser ORDER BY COUNT(lc) DESC")
    List<Object[]> findClicksByBrowserForLink(@Param("link") ProfessionalLink professionalLink);
}
