package com.helvino.dpms.repository;

import com.helvino.dpms.entity.InsuranceClaim;
import com.helvino.dpms.enums.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    Page<InsuranceClaim> findByTenantId(Long tenantId, Pageable pageable);
    long countByTenantIdAndStatus(Long tenantId, ClaimStatus status);
}
