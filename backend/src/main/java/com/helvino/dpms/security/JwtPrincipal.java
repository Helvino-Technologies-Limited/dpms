package com.helvino.dpms.security;

public record JwtPrincipal(String email, Long userId, Long tenantId, String role) {}
