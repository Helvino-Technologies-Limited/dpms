package com.helvino.dpms.repository;

import com.helvino.dpms.entity.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
    List<InsuranceProvider> findByTenantId(Long tenantId);
    List<InsuranceProvider> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
}
