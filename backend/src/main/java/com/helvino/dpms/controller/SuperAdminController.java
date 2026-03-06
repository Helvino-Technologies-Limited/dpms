package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.TenantSummaryDto;
import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.enums.TenantStatus;
import com.helvino.dpms.exception.BadRequestException;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.PatientRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTenants", tenantRepository.count());
        stats.put("activeTenants", tenantRepository.countByStatus(TenantStatus.ACTIVE));
        stats.put("trialTenants", tenantRepository.countByStatus(TenantStatus.TRIAL));
        stats.put("suspendedTenants", tenantRepository.countByStatus(TenantStatus.SUSPENDED));
        stats.put("expiredTenants", tenantRepository.countByStatus(TenantStatus.EXPIRED));
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPatients", patientRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<TenantSummaryDto>>> getAllTenants() {
        List<TenantSummaryDto> tenants = tenantRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(t -> TenantSummaryDto.builder()
                .id(t.getId())
                .clinicName(t.getClinicName())
                .ownerName(t.getOwnerName())
                .email(t.getEmail())
                .phone(t.getPhone())
                .address(t.getAddress())
                .city(t.getCity())
                .country(t.getCountry())
                .subscriptionPlan(t.getSubscriptionPlan())
                .status(t.getStatus())
                .isActive(t.getIsActive())
                .trialStartDate(t.getTrialStartDate())
                .trialEndDate(t.getTrialEndDate())
                .subscriptionStartDate(t.getSubscriptionStartDate())
                .subscriptionEndDate(t.getSubscriptionEndDate())
                .createdAt(t.getCreatedAt())
                .userCount(userRepository.countByTenantId(t.getId()))
                .patientCount(patientRepository.countByTenantId(t.getId()))
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> getTenant(@PathVariable Long id) {
        Tenant t = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
        TenantSummaryDto dto = TenantSummaryDto.builder()
            .id(t.getId())
            .clinicName(t.getClinicName())
            .ownerName(t.getOwnerName())
            .email(t.getEmail())
            .phone(t.getPhone())
            .address(t.getAddress())
            .city(t.getCity())
            .country(t.getCountry())
            .subscriptionPlan(t.getSubscriptionPlan())
            .status(t.getStatus())
            .isActive(t.getIsActive())
            .trialStartDate(t.getTrialStartDate())
            .trialEndDate(t.getTrialEndDate())
            .subscriptionStartDate(t.getSubscriptionStartDate())
            .subscriptionEndDate(t.getSubscriptionEndDate())
            .createdAt(t.getCreatedAt())
            .userCount(userRepository.countByTenantId(id))
            .patientCount(patientRepository.countByTenantId(id))
            .build();
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/tenants/{id}/status")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
        try {
            TenantStatus newStatus = TenantStatus.valueOf(status.toUpperCase());
            tenant.setStatus(newStatus);
            switch (newStatus) {
                case ACTIVE -> {
                    tenant.setIsActive(true);
                    if (tenant.getSubscriptionStartDate() == null) {
                        tenant.setSubscriptionStartDate(LocalDate.now());
                    }
                }
                case SUSPENDED, CANCELLED, EXPIRED -> tenant.setIsActive(false);
                case TRIAL -> tenant.setIsActive(true);
            }
            tenant = tenantRepository.save(tenant);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        return getTenant(id);
    }

    @PutMapping("/tenants/{id}/extend-trial")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> extendTrial(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
        LocalDate base = tenant.getTrialEndDate() != null ? tenant.getTrialEndDate() : LocalDate.now();
        tenant.setTrialEndDate(base.plusDays(days));
        tenant.setStatus(TenantStatus.TRIAL);
        tenant.setIsActive(true);
        tenantRepository.save(tenant);
        return getTenant(id);
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
        tenantRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Tenant deleted successfully", null));
    }
}
