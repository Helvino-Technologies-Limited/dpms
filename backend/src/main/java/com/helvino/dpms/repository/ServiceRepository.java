package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByTenantId(Long tenantId);
    List<Service> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
}
