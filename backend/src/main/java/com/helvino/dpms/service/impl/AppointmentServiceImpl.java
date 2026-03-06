package com.helvino.dpms.service.impl;

import com.helvino.dpms.dto.request.AppointmentRequest;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.*;
import com.helvino.dpms.enums.AppointmentStatus;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.*;
import com.helvino.dpms.service.AppointmentService;
import com.helvino.dpms.util.NumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final NumberGenerator numberGenerator;

    @Override
    @Transactional
    public Appointment createAppointment(Long tenantId, AppointmentRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient", request.getPatientId()));
        User dentist = userRepository.findById(request.getDentistId())
            .orElseThrow(() -> new ResourceNotFoundException("Dentist", request.getDentistId()));

        Appointment appointment = Appointment.builder()
            .tenant(tenant)
            .patient(patient)
            .dentist(dentist)
            .appointmentDate(request.getAppointmentDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .chiefComplaint(request.getChiefComplaint())
            .notes(request.getNotes())
            .isWalkIn(request.getIsWalkIn())
            .status(AppointmentStatus.SCHEDULED)
            .appointmentNumber(numberGenerator.generateAppointmentNumber())
            .build();

        if (request.getServiceId() != null) {
            serviceRepository.findById(request.getServiceId()).ifPresent(appointment::setService);
        }

        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public Appointment updateAppointment(Long tenantId, Long id, AppointmentRequest request) {
        Appointment appointment = getAppointment(tenantId, id);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setChiefComplaint(request.getChiefComplaint());
        appointment.setNotes(request.getNotes());
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public Appointment updateStatus(Long tenantId, Long id, AppointmentStatus status) {
        Appointment appointment = getAppointment(tenantId, id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment getAppointment(Long tenantId, Long id) {
        return appointmentRepository.findById(id)
            .filter(a -> a.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
    }

    @Override
    public List<Appointment> getTodayAppointments(Long tenantId) {
        return appointmentRepository.findByTenantIdAndAppointmentDate(tenantId, LocalDate.now());
    }

    @Override
    public List<Appointment> getAppointmentsByDateRange(Long tenantId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByTenantIdAndDateRange(tenantId, start, end);
    }

    @Override
    public PageResponse<Appointment> getAppointments(Long tenantId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        Page<Appointment> apptPage = appointmentRepository.findByTenantId(tenantId, pageRequest);
        return PageResponse.<Appointment>builder()
            .content(apptPage.getContent())
            .page(apptPage.getNumber())
            .size(apptPage.getSize())
            .totalElements(apptPage.getTotalElements())
            .totalPages(apptPage.getTotalPages())
            .first(apptPage.isFirst())
            .last(apptPage.isLast())
            .build();
    }
}
