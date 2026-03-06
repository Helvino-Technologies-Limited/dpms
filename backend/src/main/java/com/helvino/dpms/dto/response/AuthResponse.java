package com.helvino.dpms.dto.response;

import com.helvino.dpms.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long tenantId;
    private String clinicName;
    private String subscriptionStatus;
}
