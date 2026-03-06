package com.helvino.dpms.dto.request;

import com.helvino.dpms.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String occupation;
    private String nationality;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String allergies;
    private String medicalHistory;
    private String currentMedications;
    private String bloodGroup;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private String notes;
}
