package com.helvino.dpms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    private String sku;
    private String category;
    private String description;
    private String unit;
    private Integer currentStock = 0;
    private Integer minimumStock = 0;
    private Integer reorderLevel = 0;
    private BigDecimal unitCost;
    private BigDecimal sellingPrice;
    private LocalDate expiryDate;
    private String batchNumber;
    private String location;
    private Boolean isActive = true;
    private Boolean isMedicine = false;
    private Boolean isConsumable = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
}
