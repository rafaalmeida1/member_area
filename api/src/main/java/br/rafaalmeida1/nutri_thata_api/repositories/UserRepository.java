package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    java.util.List<User> findByRoleAndIsActiveTrue(Role role);

    // Métodos para dashboard
    @Query("""
        SELECT COUNT(DISTINCT u) FROM User u 
        JOIN Invite i ON i.email = u.email 
        WHERE i.createdBy.id = :professionalId AND u.role = 'PATIENT' AND u.isActive = true
    """)
    long countPatientsByProfessional(Long professionalId);

    @Query("""
        SELECT COUNT(DISTINCT u) FROM User u 
        JOIN Invite i ON i.email = u.email 
        WHERE i.createdBy.id = :professionalId AND u.role = 'PATIENT' AND u.isActive = true 
        AND u.lastLoginAt > :since
    """)
    long countActivePatientsByProfessional(Long professionalId, LocalDateTime since);
}