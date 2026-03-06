package com.helvino.dpms.repository;

import com.helvino.dpms.entity.DentalChart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DentalChartRepository extends JpaRepository<DentalChart, Long> {
    List<DentalChart> findByPatientIdAndTenantId(Long patientId, Long tenantId);
    Optional<DentalChart> findByPatientIdAndTenantIdAndToothNumber(Long patientId, Long tenantId, String toothNumber);
}
