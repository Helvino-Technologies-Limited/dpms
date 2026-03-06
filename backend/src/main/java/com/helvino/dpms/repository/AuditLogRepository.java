package com.helvino.dpms.repository;

import com.helvino.dpms.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByTenantId(Long tenantId, Pageable pageable);
    Page<AuditLog> findByTenantIdAndUserId(Long tenantId, Long userId, Pageable pageable);
}
