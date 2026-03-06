package com.helvino.dpms.util;

import com.helvino.dpms.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) auth.getPrincipal();
        }
        throw new RuntimeException("No authenticated user found");
    }

    public static Long getCurrentTenantId() {
        return getCurrentUser().getTenantId();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}
