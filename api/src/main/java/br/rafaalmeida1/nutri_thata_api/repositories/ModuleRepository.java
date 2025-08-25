package br.rafaalmeida1.nutri_thata_api.repositories;

import br.rafaalmeida1.nutri_thata_api.entities.Module;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    Page<Module> findByCategory(String category, Pageable pageable);

    Page<Module> findByCreatedBy(User createdBy, Pageable pageable);

    // Query para módulos visíveis por paciente (GENERAL + SPECIFIC para ele)
    @Query("SELECT m FROM Module m WHERE " +
           "m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND :patient MEMBER OF m.allowedPatients)")
    Page<Module> findVisibleToPatient(@Param("patient") User patient, Pageable pageable);
    
    // Query para módulos por categoria visíveis ao paciente
    @Query("SELECT m FROM Module m WHERE " +
           "m.category = :category AND " +
           "(m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND :patient MEMBER OF m.allowedPatients))")
    Page<Module> findByCategoryVisibleToPatient(@Param("category") String category, 
                                               @Param("patient") User patient, 
                                               Pageable pageable);

    @Query("SELECT DISTINCT m.category FROM Module m ORDER BY m.category")
    java.util.List<String> findDistinctCategories();
}