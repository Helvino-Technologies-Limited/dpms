package com.helvino.dpms.controller;

import com.helvino.dpms.dto.request.UserRequest;
import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.User;
import com.helvino.dpms.enums.Role;
import com.helvino.dpms.exception.BadRequestException;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.repository.UserRepository;
import com.helvino.dpms.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createStaff(@Valid @RequestBody UserRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        User user = User.builder()
            .tenant(tenant)
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "ChangeMe@123"))
            .role(request.getRole())
            .specialization(request.getSpecialization())
            .licenseNumber(request.getLicenseNumber())
            .isActive(true)
            .build();
        user = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Staff created successfully", user));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getStaff() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<User> staff = userRepository.findByTenantIdAndIsActive(tenantId, true);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @GetMapping("/dentists")
    public ResponseEntity<ApiResponse<List<User>>> getDentists() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<User> dentists = userRepository.findByTenantIdAndRoleIn(tenantId,
            List.of(Role.DENTIST, Role.TENANT_ADMIN, Role.CLINIC_MANAGER));
        return ResponseEntity.ok(ApiResponse.success(dentists));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateStaff(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        User user = userRepository.findById(id)
            .filter(u -> u.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setSpecialization(request.getSpecialization());
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Staff updated", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateStaff(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        User user = userRepository.findById(id)
            .filter(u -> u.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Staff deactivated", null));
    }
}
