package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByTenantId(Long tenantId);
    List<Supplier> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
}
