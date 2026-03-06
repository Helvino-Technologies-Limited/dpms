package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByTenantId(Long tenantId);
    List<Branch> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
}
