package br.rafaalmeida1.nutri_thata_api.repository;

import br.rafaalmeida1.nutri_thata_api.entities.LinkPageProfile;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LinkPageProfileRepository extends JpaRepository<LinkPageProfile, Long> {

    Optional<LinkPageProfile> findByProfessionalProfile(ProfessionalProfile professionalProfile);

    Optional<LinkPageProfile> findByProfessionalProfileId(Long professionalProfileId);

    boolean existsByProfessionalProfile(ProfessionalProfile professionalProfile);
}
