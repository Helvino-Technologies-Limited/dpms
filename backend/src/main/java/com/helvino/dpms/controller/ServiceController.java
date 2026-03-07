package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.Service;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.ServiceRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Service>> createService(@RequestBody Service request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        request.setTenant(tenant);
        request.setIsActive(true);
        if (request.getRequiresLab() == null) request.setRequiresLab(false);
        Service service = serviceRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Service created", service));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Service>>> getServices() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Service> services = serviceRepository.findByTenantIdAndIsActive(tenantId, true);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/all")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Service>>> getAllServices() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Service> services = serviceRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Service>> updateService(@PathVariable Long id, @RequestBody Service request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Service service = serviceRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setPrice(request.getPrice());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setProcedureCode(request.getProcedureCode());
        if (request.getRequiresLab() != null) service.setRequiresLab(request.getRequiresLab());
        service = serviceRepository.save(service);
        return ResponseEntity.ok(ApiResponse.success("Service updated", service));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Service service = serviceRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        service.setIsActive(false);
        serviceRepository.save(service);
        return ResponseEntity.ok(ApiResponse.success("Service deactivated", null));
    }
}
