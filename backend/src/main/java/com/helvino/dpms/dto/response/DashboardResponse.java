package com.helvino.dpms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardResponse {
    private long todayAppointments;
    private long patientsSeenToday;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;
    private BigDecimal outstandingPayments;
    private long pendingInsuranceClaims;
    private long totalPatients;
    private long activePatients;
    private long lowStockItems;
    private List<Map<String, Object>> recentAppointments;
    private List<Map<String, Object>> revenueChart;
    private List<Map<String, Object>> appointmentChart;
}
