package com.helvino.dpms.service;

import com.helvino.dpms.dto.request.AppointmentRequest;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Appointment;
import com.helvino.dpms.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    Appointment createAppointment(Long tenantId, AppointmentRequest request);
    Appointment updateAppointment(Long tenantId, Long id, AppointmentRequest request);
    Appointment updateStatus(Long tenantId, Long id, AppointmentStatus status);
    Appointment getAppointment(Long tenantId, Long id);
    List<Appointment> getTodayAppointments(Long tenantId);
    List<Appointment> getAppointmentsByDateRange(Long tenantId, LocalDate start, LocalDate end);
    PageResponse<Appointment> getAppointments(Long tenantId, int page, int size);
}
