package com.helvino.dpms.repository;

import com.helvino.dpms.entity.TreatmentPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Long> {
    Page<TreatmentPlan> findByTenantIdAndPatientId(Long tenantId, Long patientId, Pageable pageable);
    Page<TreatmentPlan> findByTenantId(Long tenantId, Pageable pageable);
}
