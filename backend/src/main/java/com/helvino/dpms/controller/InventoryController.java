package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Inventory;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.InventoryRepository;
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
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;
    private final TenantRepository tenantRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Inventory>> addItem(@RequestBody Inventory request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        request.setTenant(tenant);
        request.setIsActive(true);
        Inventory item = inventoryRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Item added", item));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Inventory>>> getInventory(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Inventory> items = inventoryRepository.findByTenantId(tenantId, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<Inventory>builder()
            .content(items.getContent())
            .page(items.getNumber())
            .size(items.getSize())
            .totalElements(items.getTotalElements())
            .totalPages(items.getTotalPages())
            .first(items.isFirst())
            .last(items.isLast())
            .build()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Inventory>>> getLowStock() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Inventory> items = inventoryRepository.findLowStockItems(tenantId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Inventory>> updateItem(@PathVariable Long id, @RequestBody Inventory request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Inventory item = inventoryRepository.findById(id)
            .filter(i -> i.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Inventory item", id));
        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setCurrentStock(request.getCurrentStock());
        item.setMinimumStock(request.getMinimumStock());
        item.setReorderLevel(request.getReorderLevel());
        item.setUnitCost(request.getUnitCost());
        item.setSellingPrice(request.getSellingPrice());
        item.setExpiryDate(request.getExpiryDate());
        item.setBatchNumber(request.getBatchNumber());
        item = inventoryRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success("Item updated", item));
    }
}
