package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.Supplier;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.SupplierRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final TenantRepository tenantRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@RequestBody Supplier request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        request.setTenant(tenant);
        request.setIsActive(true);
        Supplier supplier = supplierRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Supplier created", supplier));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliers() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Supplier> suppliers = supplierRepository.findByTenantIdAndIsActive(tenantId, true);
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }
}
