package com.helvino.dpms.service;

import com.helvino.dpms.dto.request.PatientRequest;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Patient;

public interface PatientService {
    Patient createPatient(Long tenantId, PatientRequest request);
    Patient updatePatient(Long tenantId, Long patientId, PatientRequest request);
    Patient getPatient(Long tenantId, Long patientId);
    PageResponse<Patient> getPatients(Long tenantId, String search, int page, int size);
    void deletePatient(Long tenantId, Long patientId);
}
