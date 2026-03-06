package com.helvino.dpms.service.impl;

import com.helvino.dpms.dto.request.PatientRequest;
import com.helvino.dpms.dto.response.PageResponse;
import com.helvino.dpms.entity.Patient;
import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.exception.ResourceNotFoundException;
import com.helvino.dpms.repository.PatientRepository;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.service.PatientService;
import com.helvino.dpms.util.NumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final TenantRepository tenantRepository;
    private final NumberGenerator numberGenerator;

    @Override
    @Transactional
    public Patient createPatient(Long tenantId, PatientRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        Patient patient = Patient.builder()
            .tenant(tenant)
            .patientNumber(numberGenerator.generatePatientNumber())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender())
            .phone(request.getPhone())
            .email(request.getEmail())
            .address(request.getAddress())
            .city(request.getCity())
            .occupation(request.getOccupation())
            .nationality(request.getNationality())
            .emergencyContactName(request.getEmergencyContactName())
            .emergencyContactPhone(request.getEmergencyContactPhone())
            .emergencyContactRelation(request.getEmergencyContactRelation())
            .allergies(request.getAllergies())
            .medicalHistory(request.getMedicalHistory())
            .currentMedications(request.getCurrentMedications())
            .bloodGroup(request.getBloodGroup())
            .insuranceProvider(request.getInsuranceProvider())
            .insurancePolicyNumber(request.getInsurancePolicyNumber())
            .insuranceGroupNumber(request.getInsuranceGroupNumber())
            .notes(request.getNotes())
            .isActive(true)
            .build();

        return patientRepository.save(patient);
    }

    @Override
    @Transactional
    public Patient updatePatient(Long tenantId, Long patientId, PatientRequest request) {
        Patient patient = getPatient(tenantId, patientId);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setCity(request.getCity());
        patient.setOccupation(request.getOccupation());
        patient.setNationality(request.getNationality());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setEmergencyContactRelation(request.getEmergencyContactRelation());
        patient.setAllergies(request.getAllergies());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsurancePolicyNumber(request.getInsurancePolicyNumber());
        patient.setInsuranceGroupNumber(request.getInsuranceGroupNumber());
        patient.setNotes(request.getNotes());
        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatient(Long tenantId, Long patientId) {
        return patientRepository.findById(patientId)
            .filter(p -> p.getTenant().getId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
    }

    @Override
    public PageResponse<Patient> getPatients(Long tenantId, String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Patient> patientPage;
        if (search != null && !search.isBlank()) {
            patientPage = patientRepository.searchByTenant(tenantId, search, pageRequest);
        } else {
            patientPage = patientRepository.findByTenantId(tenantId, pageRequest);
        }
        return PageResponse.<Patient>builder()
            .content(patientPage.getContent())
            .page(patientPage.getNumber())
            .size(patientPage.getSize())
            .totalElements(patientPage.getTotalElements())
            .totalPages(patientPage.getTotalPages())
            .first(patientPage.isFirst())
            .last(patientPage.isLast())
            .build();
    }

    @Override
    @Transactional
    public void deletePatient(Long tenantId, Long patientId) {
        Patient patient = getPatient(tenantId, patientId);
        patient.setIsActive(false);
        patientRepository.save(patient);
    }
}
