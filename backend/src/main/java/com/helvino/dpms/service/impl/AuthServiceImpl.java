package com.helvino.dpms.service.impl;

import com.helvino.dpms.dto.request.LoginRequest;
import com.helvino.dpms.dto.request.RegisterClinicRequest;
import com.helvino.dpms.dto.response.AuthResponse;
import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.entity.User;
import com.helvino.dpms.enums.Role;
import com.helvino.dpms.enums.TenantStatus;
import com.helvino.dpms.exception.BadRequestException;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.repository.UserRepository;
import com.helvino.dpms.security.CustomUserDetails;
import com.helvino.dpms.security.JwtUtil;
import com.helvino.dpms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterClinicRequest request) {
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (tenantRepository.existsByClinicName(request.getClinicName())) {
            throw new BadRequestException("Clinic name already registered");
        }

        // Create tenant
        Tenant tenant = Tenant.builder()
            .clinicName(request.getClinicName())
            .ownerName(request.getOwnerName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .city(request.getCity())
            .country(request.getCountry())
            .licenseNumber(request.getLicenseNumber())
            .status(TenantStatus.TRIAL)
            .trialStartDate(LocalDate.now())
            .trialEndDate(LocalDate.now().plusDays(5))
            .isActive(true)
            .build();
        tenant = tenantRepository.save(tenant);

        // Create admin user
        String[] nameParts = request.getOwnerName().split(" ", 2);
        User adminUser = User.builder()
            .tenant(tenant)
            .firstName(nameParts[0])
            .lastName(nameParts.length > 1 ? nameParts[1] : "")
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(Role.TENANT_ADMIN)
            .isActive(true)
            .build();
        adminUser = userRepository.save(adminUser);

        return buildAuthResponse(adminUser, tenant);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        Tenant tenant = user.getTenant();
        return buildAuthResponse(user, tenant);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        return buildAuthResponse(user, user.getTenant());
    }

    private AuthResponse buildAuthResponse(User user, Tenant tenant) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("tenantId", tenant != null ? tenant.getId() : null);
        claims.put("userId", user.getId());

        String accessToken = jwtUtil.generateToken(user.getEmail(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .tenantId(tenant != null ? tenant.getId() : null)
            .clinicName(tenant != null ? tenant.getClinicName() : null)
            .subscriptionStatus(tenant != null ? tenant.getStatus().name() : null)
            .build();
    }
}
