package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalLink;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalLinkRepository extends JpaRepository<ProfessionalLink, Long> {

    List<ProfessionalLink> findByProfessionalProfileOrderByDisplayOrderAsc(ProfessionalProfile professionalProfile);

    List<ProfessionalLink> findByProfessionalProfileAndIsActiveTrueOrderByDisplayOrderAsc(ProfessionalProfile professionalProfile);

    Optional<ProfessionalLink> findByIdAndProfessionalProfile(Long id, ProfessionalProfile professionalProfile);

    @Query("SELECT COUNT(l) FROM ProfessionalLink l WHERE l.professionalProfile = :profile")
    Long countByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT COALESCE(MAX(l.displayOrder), 0) FROM ProfessionalLink l WHERE l.professionalProfile = :profile")
    Integer findMaxDisplayOrderByProfessionalProfile(@Param("profile") ProfessionalProfile professionalProfile);

    @Query("SELECT l FROM ProfessionalLink l WHERE l.professionalProfile = :profile ORDER BY l.clickCount DESC")
    List<ProfessionalLink> findTopLinksByClickCount(@Param("profile") ProfessionalProfile professionalProfile);
}
