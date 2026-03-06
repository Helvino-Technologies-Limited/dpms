package com.helvino.dpms.controller;

import com.helvino.dpms.dto.request.InvoiceRequest;
import com.helvino.dpms.dto.request.PaymentRequest;
import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.*;
import com.helvino.dpms.enums.PaymentStatus;
import com.helvino.dpms.exception.BadRequestException;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.*;
import com.helvino.dpms.util.NumberGenerator;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final NumberGenerator numberGenerator;

    @PostMapping("/invoices")
    public ResponseEntity<ApiResponse<Invoice>> createInvoice(@RequestBody InvoiceRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        var patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient", request.getPatientId()));

        Invoice invoice = Invoice.builder()
            .tenant(tenant)
            .patient(patient)
            .invoiceNumber(numberGenerator.generateInvoiceNumber())
            .invoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now())
            .dueDate(request.getDueDate())
            .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
            .tax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO)
            .insuranceCoverage(request.getInsuranceCoverage() != null ? request.getInsuranceCoverage() : BigDecimal.ZERO)
            .notes(request.getNotes())
            .paymentStatus(PaymentStatus.PENDING)
            .amountPaid(BigDecimal.ZERO)
            .build();

        if (request.getDentistId() != null) {
            userRepository.findById(request.getDentistId()).ifPresent(invoice::setDentist);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<InvoiceItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(itemReq.getDescription())
                    .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                    .unitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO)
                    .discount(itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO)
                    .toothNumber(itemReq.getToothNumber())
                    .build();

                if (itemReq.getServiceId() != null) {
                    serviceRepository.findById(itemReq.getServiceId()).ifPresent(item::setService);
                }

                BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .subtract(item.getDiscount());
                item.setTotalPrice(lineTotal);
                subtotal = subtotal.add(lineTotal);
                items.add(item);
            }
        }

        invoice.setSubtotal(subtotal);
        BigDecimal total = subtotal
            .subtract(invoice.getDiscount())
            .add(invoice.getTax())
            .subtract(invoice.getInsuranceCoverage());
        invoice.setTotalAmount(total.compareTo(BigDecimal.ZERO) > 0 ? total : BigDecimal.ZERO);
        invoice.setBalance(invoice.getTotalAmount());
        invoice.setItems(items);

        invoice = invoiceRepository.save(invoice);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Invoice created", invoice));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<PageResponse<Invoice>>> getInvoices(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Invoice> invoicePage = invoiceRepository.findByTenantId(tenantId, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<Invoice>builder()
            .content(invoicePage.getContent())
            .page(invoicePage.getNumber())
            .size(invoicePage.getSize())
            .totalElements(invoicePage.getTotalElements())
            .totalPages(invoicePage.getTotalPages())
            .first(invoicePage.isFirst())
            .last(invoicePage.isLast())
            .build()));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<Payment>> recordPayment(@RequestBody PaymentRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice", request.getInvoiceId()));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        Payment payment = Payment.builder()
            .tenant(tenant)
            .invoice(invoice)
            .patient(invoice.getPatient())
            .paymentNumber(numberGenerator.generatePaymentNumber())
            .amount(request.getAmount())
            .paymentMethod(request.getPaymentMethod())
            .paymentDate(LocalDateTime.now())
            .transactionReference(request.getTransactionReference())
            .notes(request.getNotes())
            .isRefunded(false)
            .build();

        payment = paymentRepository.save(payment);

        // Update invoice
        BigDecimal newAmountPaid = invoice.getAmountPaid().add(request.getAmount());
        invoice.setAmountPaid(newAmountPaid);
        BigDecimal newBalance = invoice.getTotalAmount().subtract(newAmountPaid);
        invoice.setBalance(newBalance.compareTo(BigDecimal.ZERO) > 0 ? newBalance : BigDecimal.ZERO);

        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (newAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        }
        invoiceRepository.save(invoice);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Payment recorded", payment));
    }
}
