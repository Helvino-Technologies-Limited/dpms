package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tenant")
@RequiredArgsConstructor
public class TenantController {

    private final TenantRepository tenantRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Tenant>> getProfile() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        return ResponseEntity.ok(ApiResponse.success(tenant));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Tenant>> updateProfile(@RequestBody Tenant request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        tenant.setClinicName(request.getClinicName());
        tenant.setPhone(request.getPhone());
        tenant.setAddress(request.getAddress());
        tenant.setCity(request.getCity());
        tenant.setCountry(request.getCountry());
        tenant.setWebsite(request.getWebsite());
        tenant.setTaxNumber(request.getTaxNumber());
        tenant = tenantRepository.save(tenant);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", tenant));
    }
}
