package com.helvino.dpms.controller;

import com.helvino.dpms.dto.request.AppointmentRequest;
import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Appointment;
import com.helvino.dpms.enums.AppointmentStatus;
import com.helvino.dpms.service.AppointmentService;
import com.helvino.dpms.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Appointment appointment = appointmentService.createAppointment(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Appointment created successfully", appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Appointment>> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Appointment appointment = appointmentService.updateAppointment(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointment));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Appointment appointment = appointmentService.updateStatus(tenantId, id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", appointment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointment(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Appointment appointment = appointmentService.getAppointment(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<Appointment>>> getTodayAppointments() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Appointment> appointments = appointmentService.getTodayAppointments(tenantId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointmentsByRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Appointment> appointments = appointmentService.getAppointmentsByDateRange(tenantId, start, end);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Appointment>>> getAppointments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        PageResponse<Appointment> appointments = appointmentService.getAppointments(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
}
