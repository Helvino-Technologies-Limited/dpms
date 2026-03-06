package com.helvino.dpms.dto.response;

import com.helvino.dpms.enums.TenantStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TenantSummaryDto {
    private Long id;
    private String clinicName;
    private String ownerName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String subscriptionPlan;
    private TenantStatus status;
    private Boolean isActive;
    private LocalDate trialStartDate;
    private LocalDate trialEndDate;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private LocalDateTime createdAt;
    private long userCount;
    private long patientCount;
}
