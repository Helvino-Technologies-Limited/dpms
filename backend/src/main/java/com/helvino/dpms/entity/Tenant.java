package com.helvino.dpms.entity;

import com.helvino.dpms.enums.TenantStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tenants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String clinicName;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String address;
    private String city;
    private String country;
    private String licenseNumber;
    private String logo;
    private String website;
    private String taxNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantStatus status = TenantStatus.TRIAL;

    private LocalDate trialStartDate;
    private LocalDate trialEndDate;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private String subscriptionPlan;

    private Boolean isActive = true;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Patient> patients;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Branch> branches;
}
