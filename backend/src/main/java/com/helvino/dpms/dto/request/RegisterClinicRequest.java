package com.helvino.dpms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterClinicRequest {
    @NotBlank
    private String clinicName;

    @NotBlank
    private String ownerName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    private String address;
    private String city;
    private String country;
    private String licenseNumber;

    @NotBlank
    @Size(min = 8)
    private String password;
}
