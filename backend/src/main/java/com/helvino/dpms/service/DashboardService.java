package com.helvino.dpms.service;

import com.helvino.dpms.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboard(Long tenantId);
}
