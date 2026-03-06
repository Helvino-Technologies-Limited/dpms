package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.InsuranceClaim;
import com.helvino.dpms.entity.InsuranceProvider;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.InsuranceClaimRepository;
import com.helvino.dpms.repository.InsuranceProviderRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceProviderRepository providerRepository;
    private final InsuranceClaimRepository claimRepository;
    private final TenantRepository tenantRepository;

    @PostMapping("/providers")
    public ResponseEntity<ApiResponse<InsuranceProvider>> createProvider(@RequestBody InsuranceProvider request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        request.setTenant(tenant);
        request.setIsActive(true);
        InsuranceProvider provider = providerRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Provider created", provider));
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<InsuranceProvider>>> getProviders() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<InsuranceProvider> providers = providerRepository.findByTenantIdAndIsActive(tenantId, true);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<PageResponse<InsuranceClaim>>> getClaims(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InsuranceClaim> claims = claimRepository.findByTenantId(tenantId, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<InsuranceClaim>builder()
            .content(claims.getContent())
            .page(claims.getNumber())
            .size(claims.getSize())
            .totalElements(claims.getTotalElements())
            .totalPages(claims.getTotalPages())
            .first(claims.isFirst())
            .last(claims.isLast())
            .build()));
    }
}
