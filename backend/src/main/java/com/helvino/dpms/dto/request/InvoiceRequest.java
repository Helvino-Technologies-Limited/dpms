package com.helvino.dpms.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {
    private Long patientId;
    private Long dentistId;
    private Long appointmentId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal insuranceCoverage;
    private String notes;
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        private Long serviceId;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private String toothNumber;
    }
}
