package com.helvino.dpms.repository;

import com.helvino.dpms.entity.User;
import com.helvino.dpms.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByTenantId(Long tenantId);
    List<User> findByTenantIdAndRole(Long tenantId, Role role);
    List<User> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
    List<User> findByTenantIdAndRoleIn(Long tenantId, List<Role> roles);
}
