package com.helvino.dpms.entity;

import com.helvino.dpms.enums.ToothCondition;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dental_charts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DentalChart extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String toothNumber;

    private String toothName;

    @Enumerated(EnumType.STRING)
    private ToothCondition condition = ToothCondition.HEALTHY;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String surface;
    private Boolean isMissing = false;
    private Boolean hasCrown = false;
    private Boolean hasImplant = false;
    private Boolean hasBridge = false;
    private Boolean hasRootCanal = false;
    private Boolean hasFilling = false;
    private String fillingMaterial;
}
