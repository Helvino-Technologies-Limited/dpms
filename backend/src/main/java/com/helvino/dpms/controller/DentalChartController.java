package com.helvino.dpms.controller;

import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.entity.DentalChart;
import com.helvino.dpms.enums.ToothCondition;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.DentalChartRepository;
import com.helvino.dpms.repository.PatientRepository;
import com.helvino.dpms.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dental-chart")
@RequiredArgsConstructor
public class DentalChartController {

    private final DentalChartRepository dentalChartRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<DentalChart>>> getPatientChart(@PathVariable Long patientId) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<DentalChart> chart = dentalChartRepository.findByPatientIdAndTenantId(patientId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(chart));
    }

    @PutMapping("/patient/{patientId}/tooth/{toothNumber}")
    public ResponseEntity<ApiResponse<DentalChart>> updateTooth(
        @PathVariable Long patientId,
        @PathVariable String toothNumber,
        @RequestBody DentalChart chartData
    ) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        var patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        DentalChart chart = dentalChartRepository
            .findByPatientIdAndTenantIdAndToothNumber(patientId, tenantId, toothNumber)
            .orElse(DentalChart.builder()
                .patient(patient)
                .toothNumber(toothNumber)
                .build());

        var tenant = patient.getTenant();
        chart.setTenant(tenant);
        chart.setCondition(chartData.getCondition());
        chart.setNotes(chartData.getNotes());
        chart.setHasCrown(chartData.getHasCrown());
        chart.setHasImplant(chartData.getHasImplant());
        chart.setHasBridge(chartData.getHasBridge());
        chart.setHasRootCanal(chartData.getHasRootCanal());
        chart.setHasFilling(chartData.getHasFilling());
        chart.setIsMissing(chartData.getIsMissing());
        chart.setFillingMaterial(chartData.getFillingMaterial());
        chart.setSurface(chartData.getSurface());

        chart = dentalChartRepository.save(chart);
        return ResponseEntity.ok(ApiResponse.success("Tooth updated", chart));
    }
}
