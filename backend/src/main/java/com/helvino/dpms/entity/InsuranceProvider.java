package com.helvino.dpms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "insurance_providers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsuranceProvider extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    private String code;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String claimsEmail;
    private String claimsPhone;
    private Boolean isActive = true;
    private String notes;
}
