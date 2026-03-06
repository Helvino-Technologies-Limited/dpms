package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientNumberAndTenantId(String patientNumber, Long tenantId);

    @Query("SELECT p FROM Patient p WHERE p.tenant.id = :tenantId AND " +
           "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Patient> searchByTenant(@Param("tenantId") Long tenantId, @Param("query") String query, Pageable pageable);

    Page<Patient> findByTenantId(Long tenantId, Pageable pageable);
    long countByTenantId(Long tenantId);
    long countByTenantIdAndIsActive(Long tenantId, Boolean isActive);

    @Query("SELECT COUNT(DISTINCT p) FROM Patient p JOIN p.appointments a WHERE p.tenant.id = :tenantId AND FUNCTION('DATE', a.appointmentDate) = CURRENT_DATE")
    long countPatientsSeenToday(@Param("tenantId") Long tenantId);
}
