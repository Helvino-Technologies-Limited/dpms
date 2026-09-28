package com.helvino.dpms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helvino.dpms.dto.response.ApiResponse;
import com.helvino.dpms.exception.TenantInactiveException;
import com.helvino.dpms.service.TenantAccessService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Blocks requests from users whose clinic is expired, suspended or cancelled — including
 * users holding a token issued before the tenant went inactive. Results are cached briefly
 * so this adds at most one tenant lookup per clinic per minute.
 *
 * Not a @Component on purpose: it is added to the security chain in SecurityConfig and must
 * not also be auto-registered as a servlet filter.
 */
public class TenantAccessFilter extends OncePerRequestFilter {

    private static final long CACHE_TTL_MS = 60_000;

    private record CachedResult(String denyReason, long checkedAt) {}

    private final TenantAccessService tenantAccessService;
    private final ObjectMapper objectMapper;
    private final Map<Long, CachedResult> cache = new ConcurrentHashMap<>();

    public TenantAccessFilter(TenantAccessService tenantAccessService, ObjectMapper objectMapper) {
        this.tenantAccessService = tenantAccessService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/") || path.startsWith("/actuator/");
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal && principal.tenantId() != null) {
            String denyReason = check(principal.tenantId());
            if (denyReason != null) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getOutputStream(), ApiResponse.<Void>builder()
                    .success(false)
                    .message(denyReason)
                    .errors(Map.of("code", TenantInactiveException.CODE))
                    .build());
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private String check(Long tenantId) {
        long now = System.currentTimeMillis();
        CachedResult cached = cache.get(tenantId);
        if (cached != null && now - cached.checkedAt() < CACHE_TTL_MS) {
            return cached.denyReason();
        }
        String denyReason = null;
        try {
            tenantAccessService.assertActive(tenantId);
        } catch (TenantInactiveException e) {
            denyReason = e.getMessage();
        }
        cache.put(tenantId, new CachedResult(denyReason, now));
        return denyReason;
    }
}
