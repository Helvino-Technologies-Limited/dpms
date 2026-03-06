package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.*;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.*;
import com.helvino.dpms.util.NumberGenerator;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final NumberGenerator numberGenerator;

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> create(@RequestBody Map<String, Object> req) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Patient patient = patientRepository.findById(Long.valueOf(req.get("patientId").toString())).orElseThrow(() -> new ResourceNotFoundException("Patient", 0L));
        User dentist = userRepository.findById(Long.valueOf(req.get("dentistId").toString())).orElseThrow(() -> new ResourceNotFoundException("Dentist", 0L));

        Prescription rx = new Prescription();
        rx.setTenant(tenant);
        rx.setPatient(patient);
        rx.setDentist(dentist);
        rx.setPrescriptionNumber(numberGenerator.generatePrescriptionNumber());
        rx.setDiagnosis(getStr(req, "diagnosis"));
        rx.setNotes(getStr(req, "notes"));
        String dateStr = getStr(req, "prescriptionDate");
        rx.setPrescriptionDate(dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now());

        List<PrescriptionItem> items = new ArrayList<>();
        Object rawItems = req.get("items");
        if (rawItems instanceof List<?> rawList) {
            for (Object o : rawList) {
                if (o instanceof Map<?, ?> itemMap) {
                    PrescriptionItem item = new PrescriptionItem();
                    item.setPrescription(rx);
                    item.setMedicineName(str(itemMap, "medicineName"));
                    item.setDosage(str(itemMap, "dosage"));
                    item.setFrequency(str(itemMap, "frequency"));
                    item.setDuration(str(itemMap, "duration"));
                    item.setInstructions(str(itemMap, "instructions"));
                    String qty = str(itemMap, "quantity");
                    if (qty != null && !qty.isBlank()) {
                        try { item.setQuantity(Integer.parseInt(qty.replaceAll("[^0-9]", ""))); } catch (Exception ignored) {}
                    }
                    items.add(item);
                }
            }
        }
        rx.setItems(items);
        rx = prescriptionRepository.save(rx);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Prescription created", rx));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<PageResponse<Prescription>>> list(
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Page<Prescription> rxPage = prescriptionRepository.findByTenantId(tenantId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<Prescription>builder()
            .content(rxPage.getContent()).page(rxPage.getNumber()).size(rxPage.getSize())
            .totalElements(rxPage.getTotalElements()).totalPages(rxPage.getTotalPages())
            .first(rxPage.isFirst()).last(rxPage.isLast()).build()));
    }

    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<ApiResponse<PageResponse<Prescription>>> getPatientPrescriptions(
        @PathVariable Long patientId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Page<Prescription> rxPage = prescriptionRepository.findByTenantIdAndPatientId(tenantId, patientId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<Prescription>builder()
            .content(rxPage.getContent()).page(rxPage.getNumber()).size(rxPage.getSize())
            .totalElements(rxPage.getTotalElements()).totalPages(rxPage.getTotalPages())
            .first(rxPage.isFirst()).last(rxPage.isLast()).build()));
    }

    private String getStr(Map<String, Object> map, String key) {
        return map.get(key) != null ? map.get(key).toString() : null;
    }
    private String str(Map<?, ?> map, String key) {
        return map.get(key) != null ? map.get(key).toString() : null;
    }
}
