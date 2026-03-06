package com.helvino.dpms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    @NotNull
    private Long patientId;
    @NotNull
    private Long dentistId;
    private Long serviceId;
    private Long branchId;
    @NotNull
    private LocalDate appointmentDate;
    @NotNull
    private LocalTime startTime;
    private LocalTime endTime;
    private String chiefComplaint;
    private String notes;
    private Boolean isWalkIn = false;
}
