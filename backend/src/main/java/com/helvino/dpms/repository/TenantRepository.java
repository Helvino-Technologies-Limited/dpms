package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.enums.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByClinicName(String clinicName);
    List<Tenant> findByStatus(TenantStatus status);
    List<Tenant> findByIsActive(Boolean isActive);
}
