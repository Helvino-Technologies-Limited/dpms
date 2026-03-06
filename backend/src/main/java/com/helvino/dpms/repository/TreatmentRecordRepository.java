package com.helvino.dpms.repository;

import com.helvino.dpms.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByTreatmentPlanIdAndTenantId(Long planId, Long tenantId);
    List<TreatmentRecord> findByPatientIdAndTenantId(Long patientId, Long tenantId);
}
