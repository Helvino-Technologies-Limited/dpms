package com.helvino.dpms.service;

import com.helvino.dpms.dto.request.LoginRequest;
import com.helvino.dpms.dto.request.RegisterClinicRequest;
import com.helvino.dpms.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterClinicRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
}
