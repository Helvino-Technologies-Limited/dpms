package com.helvino.dpms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @Column(nullable = false)
    private String description;

    private Integer quantity = 1;
    private BigDecimal unitPrice;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal totalPrice;
    private String toothNumber;
}
