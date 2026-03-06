package com.helvino.dpms.dto.request;

import com.helvino.dpms.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long invoiceId;
    @NotNull
    private BigDecimal amount;
    @NotNull
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private String notes;
}
