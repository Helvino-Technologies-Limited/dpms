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

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentPlanRepository planRepository;
    private final TreatmentRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final AppointmentRepository appointmentRepository;
    private final NumberGenerator numberGenerator;

    @PostMapping("/treatment-plans")
    public ResponseEntity<ApiResponse<TreatmentPlan>> createPlan(@RequestBody Map<String, Object> req) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Patient patient = patientRepository.findById(Long.valueOf(req.get("patientId").toString())).orElseThrow(() -> new ResourceNotFoundException("Patient", 0L));
        User dentist = userRepository.findById(Long.valueOf(req.get("dentistId").toString())).orElseThrow(() -> new ResourceNotFoundException("Dentist", 0L));

        TreatmentPlan plan = new TreatmentPlan();
        plan.setTenant(tenant);
        plan.setPatient(patient);
        plan.setDentist(dentist);
        plan.setPlanNumber(numberGenerator.generateAppointmentNumber().replace("APT", "PLN"));
        plan.setTitle(getStr(req, "title"));
        plan.setDiagnosis(getStr(req, "diagnosis"));
        plan.setTreatmentDescription(getStr(req, "treatmentDescription"));
        plan.setStatus(req.getOrDefault("status", "PENDING").toString());
        if (req.get("startDate") != null) plan.setStartDate(java.time.LocalDate.parse(req.get("startDate").toString()));
        if (req.get("expectedEndDate") != null) plan.setExpectedEndDate(java.time.LocalDate.parse(req.get("expectedEndDate").toString()));
        if (req.get("estimatedCost") != null) plan.setEstimatedCost(new java.math.BigDecimal(req.get("estimatedCost").toString()));
        if (req.get("totalPhases") != null) plan.setTotalPhases(Integer.parseInt(req.get("totalPhases").toString()));
        plan.setCompletedPhases(0);
        plan = planRepository.save(plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Treatment plan created", plan));
    }

    @GetMapping("/treatment-plans")
    public ResponseEntity<ApiResponse<PageResponse<TreatmentPlan>>> getPlans(
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Page<TreatmentPlan> plans = planRepository.findByTenantId(tenantId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<TreatmentPlan>builder()
            .content(plans.getContent()).page(plans.getNumber()).size(plans.getSize())
            .totalElements(plans.getTotalElements()).totalPages(plans.getTotalPages())
            .first(plans.isFirst()).last(plans.isLast()).build()));
    }

    @PatchMapping("/treatment-plans/{id}/status")
    public ResponseEntity<ApiResponse<TreatmentPlan>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        TreatmentPlan plan = planRepository.findById(id).filter(p -> p.getTenant().getId().equals(tenantId)).orElseThrow(() -> new ResourceNotFoundException("Plan", id));
        plan.setStatus(status);
        planRepository.save(plan);
        return ResponseEntity.ok(ApiResponse.success("Status updated", plan));
    }

    @GetMapping("/treatment-plans/{id}/records")
    public ResponseEntity<ApiResponse<List<TreatmentRecord>>> getRecords(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<TreatmentRecord> records = recordRepository.findByTreatmentPlanIdAndTenantId(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @PostMapping("/treatment-records")
    public ResponseEntity<ApiResponse<TreatmentRecord>> createRecord(@RequestBody Map<String, Object> req) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Patient patient = patientRepository.findById(Long.valueOf(req.get("patientId").toString())).orElseThrow(() -> new ResourceNotFoundException("Patient", 0L));
        User dentist = userRepository.findById(Long.valueOf(req.get("dentistId").toString())).orElseThrow(() -> new ResourceNotFoundException("Dentist", 0L));

        TreatmentRecord record = new TreatmentRecord();
        record.setTenant(tenant);
        record.setPatient(patient);
        record.setDentist(dentist);
        record.setClinicalNotes(getStr(req, "clinicalNotes"));
        record.setFindings(getStr(req, "findings"));
        record.setProcedureDone(getStr(req, "procedureDone"));
        record.setToothNumber(getStr(req, "toothNumber"));
        record.setStatus(req.getOrDefault("status", "COMPLETED").toString());
        if (req.get("treatmentDate") != null) record.setTreatmentDate(java.time.LocalDate.parse(req.get("treatmentDate").toString()));
        if (req.get("cost") != null) record.setCost(new java.math.BigDecimal(req.get("cost").toString()));
        if (req.get("phaseNumber") != null) record.setPhaseNumber(Integer.parseInt(req.get("phaseNumber").toString()));

        if (req.get("treatmentPlanId") != null) {
            planRepository.findById(Long.valueOf(req.get("treatmentPlanId").toString())).ifPresent(plan -> {
                record.setTreatmentPlan(plan);
                if ("COMPLETED".equals(record.getStatus())) {
                    plan.setCompletedPhases((plan.getCompletedPhases() == null ? 0 : plan.getCompletedPhases()) + 1);
                    planRepository.save(plan);
                }
            });
        }
        if (req.get("serviceId") != null) {
            serviceRepository.findById(Long.valueOf(req.get("serviceId").toString())).ifPresent(record::setService);
        }

        TreatmentRecord saved = recordRepository.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Record added", saved));
    }

    private String getStr(Map<String, Object> req, String key) {
        return req.get(key) != null ? req.get(key).toString() : null;
    }
}
