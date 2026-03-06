package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.DashboardResponse;
import com.helvino.dpms.service.DashboardService;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        DashboardResponse dashboard = dashboardService.getDashboard(tenantId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
