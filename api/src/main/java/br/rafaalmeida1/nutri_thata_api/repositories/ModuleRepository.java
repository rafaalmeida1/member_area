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

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    Page<Module> findByCategory(String category, Pageable pageable);

    Page<Module> findByCreatedBy(User createdBy, Pageable pageable);

    // Query para módulos visíveis por paciente (GENERAL + SPECIFIC para ele)
    @Query("SELECT m FROM Module m WHERE " +
           "m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND :patient MEMBER OF m.allowedPatients) " +
           "ORDER BY m.orderIndex ASC")
    Page<Module> findVisibleToPatient(@Param("patient") User patient, Pageable pageable);
    
    // Query para módulos por categoria visíveis ao paciente
    @Query("SELECT m FROM Module m WHERE " +
           "m.category = :category AND " +
           "(m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND :patient MEMBER OF m.allowedPatients)) " +
           "ORDER BY m.orderIndex ASC")
    Page<Module> findByCategoryVisibleToPatient(@Param("category") String category, 
                                               @Param("patient") User patient, 
                                               Pageable pageable);

    @Query("SELECT DISTINCT m.category FROM Module m ORDER BY m.category")
    java.util.List<String> findDistinctCategories();

    // Métodos adicionados para suportar o ModuleService
    Page<Module> findByCreatedByOrderByCreatedAtDesc(User createdBy, Pageable pageable);

    Page<Module> findByCreatedByOrderByOrderIndexAsc(User createdBy, Pageable pageable);

    @Query("SELECT m FROM Module m WHERE " +
           "m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND EXISTS (SELECT 1 FROM m.allowedPatients p WHERE p.id = :userId)) " +
           "ORDER BY m.orderIndex ASC")
    Page<Module> findVisibleModulesForUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT m.category FROM Module m WHERE m.createdBy = :createdBy ORDER BY m.category")
    List<String> findDistinctCategoriesByCreatedBy(@Param("createdBy") User createdBy);

    @Query("SELECT DISTINCT m.category FROM Module m WHERE " +
           "m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND EXISTS (SELECT 1 FROM m.allowedPatients p WHERE p.id = :userId))")
    List<String> findDistinctCategoriesForUser(@Param("userId") Long userId);

    // Métodos para cache (sem paginação)
    List<Module> findByCreatedBy(User createdBy);

    List<Module> findByCreatedByOrderByOrderIndexAsc(User createdBy);

    @Query("SELECT m FROM Module m WHERE " +
           "m.visibility = 'GENERAL' OR " +
           "(m.visibility = 'SPECIFIC' AND :patient MEMBER OF m.allowedPatients) " +
           "ORDER BY m.orderIndex ASC")
    List<Module> findVisibleToPatient(@Param("patient") User patient);

    // Métodos para dashboard
    long countByCreatedBy(User createdBy);
    
    long countByCreatedByAndIsActive(User createdBy, boolean isActive);
    
    @Query("SELECT SUM(m.viewCount) FROM Module m WHERE m.createdBy = :createdBy")
    Long sumViewCountByCreatedBy(@Param("createdBy") User createdBy);
    
    @Query("SELECT COUNT(m) FROM Module m WHERE m.visibility = 'GENERAL' OR (m.visibility = 'SPECIFIC' AND EXISTS (SELECT 1 FROM m.allowedPatients p WHERE p.id = :patientId))")
    long countVisibleToPatient(@Param("patientId") Long patientId);
    
    // TODO: Implementar quando as entidades ModuleView e ModuleCompletion estiverem disponíveis
    // long countViewedByPatient(@Param("patientId") Long patientId);
    // long countCompletedByPatient(@Param("patientId") Long patientId);
    // long sumStudyTimeByPatient(@Param("patientId") Long patientId);
}