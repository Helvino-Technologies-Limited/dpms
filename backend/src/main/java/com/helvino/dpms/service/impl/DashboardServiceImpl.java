package com.helvino.dpms.service.impl;

import com.helvino.dpms.dto.response.DashboardResponse;
import com.helvino.dpms.enums.ClaimStatus;
import com.helvino.dpms.repository.*;
import com.helvino.dpms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final InvoiceRepository invoiceRepository;
    private final InsuranceClaimRepository claimRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public DashboardResponse getDashboard(Long tenantId) {
        LocalDate today = LocalDate.now();

        long todayAppointments = appointmentRepository.countByTenantIdAndAppointmentDate(tenantId, today);
        long patientsSeenToday = patientRepository.countPatientsSeenToday(tenantId);
        BigDecimal revenueToday = invoiceRepository.sumRevenueByDate(tenantId, today);
        BigDecimal revenueThisMonth = invoiceRepository.sumRevenueByMonth(tenantId, today.getYear(), today.getMonthValue());
        BigDecimal outstanding = invoiceRepository.sumOutstandingBalance(tenantId);
        long pendingClaims = claimRepository.countByTenantIdAndStatus(tenantId, ClaimStatus.SUBMITTED);
        long totalPatients = patientRepository.countByTenantId(tenantId);
        long activePatients = patientRepository.countByTenantIdAndIsActive(tenantId, true);
        long lowStock = inventoryRepository.findLowStockItems(tenantId).size();

        return DashboardResponse.builder()
            .todayAppointments(todayAppointments)
            .patientsSeenToday(patientsSeenToday)
            .revenueToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
            .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
            .outstandingPayments(outstanding != null ? outstanding : BigDecimal.ZERO)
            .pendingInsuranceClaims(pendingClaims)
            .totalPatients(totalPatients)
            .activePatients(activePatients)
            .lowStockItems(lowStock)
            .build();
    }
}
