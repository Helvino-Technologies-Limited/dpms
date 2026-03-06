package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Page<Inventory> findByTenantId(Long tenantId, Pageable pageable);
    List<Inventory> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);

    @Query("SELECT i FROM Inventory i WHERE i.tenant.id = :tenantId AND i.currentStock <= i.reorderLevel")
    List<Inventory> findLowStockItems(@Param("tenantId") Long tenantId);
}
