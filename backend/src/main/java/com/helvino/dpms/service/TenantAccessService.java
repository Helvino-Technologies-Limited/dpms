package com.helvino.dpms.service;

import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.enums.TenantStatus;
import com.helvino.dpms.exception.TenantInactiveException;
import com.helvino.dpms.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Decides whether a tenant may still use the system, and expires tenants whose
 * trial or paid subscription has run out.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantAccessService {

    private final TenantRepository tenantRepository;

    @Value("${app.trial.days:5}")
    private int trialDays;

    /** Last day of the trial is the day before trialEndDate (start + trialDays). */
    public boolean isTrialOver(Tenant tenant, LocalDate today) {
        LocalDate end = tenant.getTrialEndDate();
        if (end == null && tenant.getCreatedAt() != null) {
            end = tenant.getCreatedAt().toLocalDate().plusDays(trialDays);
        }
        return end != null && !today.isBefore(end);
    }

    public boolean isSubscriptionOver(Tenant tenant, LocalDate today) {
        LocalDate end = tenant.getSubscriptionEndDate();
        return end != null && today.isAfter(end);
    }

    /** Marks the tenant EXPIRED if its trial/subscription has run out. Returns true if it changed. */
    public boolean expireIfDue(Tenant tenant, LocalDate today) {
        boolean due = switch (tenant.getStatus()) {
            case TRIAL -> isTrialOver(tenant, today);
            case ACTIVE -> isSubscriptionOver(tenant, today);
            default -> false;
        };
        if (!due) return false;
        tenant.setStatus(TenantStatus.EXPIRED);
        tenant.setIsActive(false);
        tenantRepository.save(tenant);
        log.info("Tenant {} ({}) expired", tenant.getId(), tenant.getClinicName());
        return true;
    }

    /** Throws if the tenant may not use the system; expires it first if due. Null = platform user. */
    @Transactional
    public void assertActive(Tenant tenant) {
        if (tenant == null) return;
        expireIfDue(tenant, LocalDate.now());
        String reason = inactiveReason(tenant);
        if (reason != null) throw new TenantInactiveException(reason);
    }

    @Transactional
    public void assertActive(Long tenantId) {
        if (tenantId == null) return;
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new TenantInactiveException("Clinic account not found."));
        assertActive(tenant);
    }

    private String inactiveReason(Tenant tenant) {
        return switch (tenant.getStatus()) {
            case EXPIRED -> tenant.getSubscriptionEndDate() != null
                ? "Your clinic's subscription has expired. Please contact Helvino Technologies to renew."
                : "Your clinic's free trial has ended. Please contact Helvino Technologies to subscribe.";
            case SUSPENDED -> "Your clinic account has been suspended. Please contact Helvino Technologies.";
            case CANCELLED -> "Your clinic account has been cancelled. Please contact Helvino Technologies.";
            default -> Boolean.FALSE.equals(tenant.getIsActive())
                ? "Your clinic account is inactive. Please contact Helvino Technologies."
                : null;
        };
    }

    /** Runs at startup and every hour so expired tenants show correctly in the super-admin views too. */
    @Scheduled(initialDelay = 30_000, fixedDelay = 3_600_000)
    @Transactional
    public void expireDueTenants() {
        LocalDate today = LocalDate.now();
        List<Tenant> candidates = tenantRepository.findByStatusIn(List.of(TenantStatus.TRIAL, TenantStatus.ACTIVE));
        long expired = candidates.stream().filter(t -> expireIfDue(t, today)).count();
        if (expired > 0) log.info("Expired {} tenant(s)", expired);
    }
}
