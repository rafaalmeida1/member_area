package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.ContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContentBlockRepository extends JpaRepository<ContentBlock, UUID> {
} 