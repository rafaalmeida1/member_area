package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.Invite;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.InviteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InviteRepository extends JpaRepository<Invite, UUID> {

    Optional<Invite> findByToken(String token);

    boolean existsByEmailAndStatus(String email, InviteStatus status);

    Page<Invite> findByCreatedBy(User createdBy, Pageable pageable);

    Page<Invite> findByCreatedByAndStatus(User createdBy, InviteStatus status, Pageable pageable);

    @Query("SELECT i FROM Invite i WHERE i.status = 'PENDING' AND i.expiresAt < :now")
    java.util.List<Invite> findExpiredInvites(LocalDateTime now);

    Optional<Invite> findByEmailAndStatus(String email, InviteStatus status);

    // Métodos para dashboard
    long countByCreatedBy(User createdBy);
    
    long countByCreatedByAndCreatedAtAfter(User createdBy, LocalDateTime since);
}