package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.ContentBlock;
import br.rafaalmeida1.nutri_thata_api.entities.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContentBlockRepository extends JpaRepository<ContentBlock, UUID> {
    
    @Modifying
    @Query("DELETE FROM ContentBlock cb WHERE cb.module = :module")
    void deleteByModule(@Param("module") Module module);
} 