package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.Branch;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.BranchRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchRepository branchRepository;
    private final TenantRepository tenantRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Branch>> createBranch(@RequestBody Branch request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        request.setTenant(tenant);
        request.setIsActive(true);
        if (request.getIsMainBranch() == null) request.setIsMainBranch(false);
        Branch branch = branchRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Branch created", branch));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Branch>>> getBranches() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Branch> branches = branchRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success(branches));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> updateBranch(
            @PathVariable Long id, @RequestBody Branch request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Branch branch = branchRepository.findById(id)
            .filter(b -> b.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Branch", id));
        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setCity(request.getCity());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setManagerName(request.getManagerName());
        if (request.getIsMainBranch() != null) branch.setIsMainBranch(request.getIsMainBranch());
        branch = branchRepository.save(branch);
        return ResponseEntity.ok(ApiResponse.success("Branch updated", branch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateBranch(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Branch branch = branchRepository.findById(id)
            .filter(b -> b.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Branch", id));
        branch.setIsActive(false);
        branchRepository.save(branch);
        return ResponseEntity.ok(ApiResponse.success("Branch deactivated", null));
    }
}
