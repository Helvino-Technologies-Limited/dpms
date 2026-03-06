package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByTenantIdAndPatientId(Long tenantId, Long patientId, Pageable pageable);
    Page<Prescription> findByTenantId(Long tenantId, Pageable pageable);
}
