package com.helvino.dpms.controller;

import com.helvino.dpms.dto.request.PatientRequest;
import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Patient;
import com.helvino.dpms.service.PatientService;
import com.helvino.dpms.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody PatientRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Patient patient = patientService.createPatient(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Patient created successfully", patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Patient patient = patientService.updatePatient(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patient));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> getPatient(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Patient patient = patientService.getPatient(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Patient>>> getPatients(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        PageResponse<Patient> patients = patientService.getPatients(tenantId, search, page, size);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        patientService.deletePatient(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Patient deactivated successfully", null));
    }
}
