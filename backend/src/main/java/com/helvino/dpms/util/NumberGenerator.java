package com.helvino.dpms.util;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class NumberGenerator {

    private final AtomicLong counter = new AtomicLong(0);

    public String generatePatientNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        return "PT" + date + String.format("%04d", counter.incrementAndGet());
    }

    public String generateInvoiceNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        return "INV" + date + String.format("%04d", counter.incrementAndGet());
    }

    public String generatePaymentNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "PAY" + date + String.format("%04d", counter.incrementAndGet());
    }

    public String generateAppointmentNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "APT" + date + String.format("%04d", counter.incrementAndGet());
    }

    public String generateClaimNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        return "CLM" + date + String.format("%04d", counter.incrementAndGet());
    }

    public String generatePrescriptionNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "RX" + date + String.format("%04d", counter.incrementAndGet());
    }
}
