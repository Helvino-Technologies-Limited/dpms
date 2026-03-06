package com.helvino.dpms.dto.request;

import com.helvino.dpms.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank @Email
    private String email;
    private String phone;
    private String password;
    @NotNull
    private Role role;
    private String specialization;
    private String licenseNumber;
}
