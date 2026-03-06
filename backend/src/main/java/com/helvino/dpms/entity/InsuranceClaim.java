package com.helvino.dpms.entity;

import com.helvino.dpms.enums.ClaimStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_claims")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsuranceClaim extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_provider_id", nullable = false)
    private InsuranceProvider insuranceProvider;

    private String claimNumber;
    private String policyNumber;
    private LocalDate submissionDate;
    private LocalDate approvalDate;
    private BigDecimal claimAmount;
    private BigDecimal approvedAmount;
    private BigDecimal paidAmount;
    private BigDecimal patientCopay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
