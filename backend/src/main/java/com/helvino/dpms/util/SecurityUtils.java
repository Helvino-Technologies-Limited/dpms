package com.helvino.dpms.util;

import com.helvino.dpms.security.CustomUserDetails;
import com.helvino.dpms.security.JwtPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Long getCurrentTenantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("No authenticated user found");
        if (auth.getPrincipal() instanceof JwtPrincipal p) return p.tenantId();
        if (auth.getPrincipal() instanceof CustomUserDetails d) return d.getTenantId();
        throw new RuntimeException("Unknown principal type");
    }

    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("No authenticated user found");
        if (auth.getPrincipal() instanceof JwtPrincipal p) return p.userId();
        if (auth.getPrincipal() instanceof CustomUserDetails d) return d.getUserId();
        throw new RuntimeException("Unknown principal type");
    }

    public static CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails d) return d;
        throw new RuntimeException("No authenticated user found");
    }
}
