package com.helvino.dpms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "treatment_plans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TreatmentPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentist_id", nullable = false)
    private User dentist;

    private String planNumber;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatmentDescription;

    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private BigDecimal estimatedCost;
    private String status;
    private Integer totalPhases;
    private Integer completedPhases;

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TreatmentRecord> records;
}
