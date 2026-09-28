package com.helvino.dpms.config;

import com.helvino.dpms.entity.Tenant;
import com.helvino.dpms.entity.User;
import com.helvino.dpms.enums.Role;
import com.helvino.dpms.enums.TenantStatus;
import com.helvino.dpms.repository.TenantRepository;
import com.helvino.dpms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds a demo clinic with one user per common role so the login page can offer
 * one-click demo logins. Runs on every startup and resets the demo passwords, so
 * the accounts stay usable even if a tester changes them. Disable with DEMO_ENABLED=false.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements ApplicationRunner {

    public static final String DEMO_TENANT_EMAIL = "demo@dpms.helvino.org";

    private record DemoUser(String email, String firstName, String lastName, Role role) {}

    private static final List<DemoUser> DEMO_USERS = List.of(
        new DemoUser("admin@demo.helvino.org", "Demo", "Admin", Role.TENANT_ADMIN),
        new DemoUser("dentist@demo.helvino.org", "Demo", "Dentist", Role.DENTIST),
        new DemoUser("reception@demo.helvino.org", "Demo", "Receptionist", Role.RECEPTIONIST),
        new DemoUser("cashier@demo.helvino.org", "Demo", "Cashier", Role.CASHIER)
    );

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.password:Demo@1234}")
    private String demoPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Tenant tenant = tenantRepository.findByEmail(DEMO_TENANT_EMAIL)
            .orElseGet(() -> tenantRepository.save(Tenant.builder()
                .clinicName("Demo Dental Clinic")
                .ownerName("Demo Admin")
                .email(DEMO_TENANT_EMAIL)
                .phone("+254700000000")
                .city("Nairobi")
                .country("Kenya")
                .status(TenantStatus.ACTIVE)
                .trialStartDate(LocalDate.now())
                .trialEndDate(LocalDate.now().plusYears(10))
                .subscriptionStartDate(LocalDate.now())
                .subscriptionEndDate(LocalDate.now().plusYears(10))
                .subscriptionPlan("DEMO")
                .isActive(true)
                .build()));

        // Keep the demo clinic usable even if someone suspended it
        tenant.setStatus(TenantStatus.ACTIVE);
        tenant.setIsActive(true);

        String encoded = passwordEncoder.encode(demoPassword);
        for (DemoUser d : DEMO_USERS) {
            User user = userRepository.findByEmail(d.email()).orElse(null);
            if (user == null) {
                user = User.builder()
                    .tenant(tenant)
                    .firstName(d.firstName())
                    .lastName(d.lastName())
                    .email(d.email())
                    .role(d.role())
                    .twoFactorEnabled(false)
                    .build();
            } else if (user.getTenant() == null || !user.getTenant().getId().equals(tenant.getId())) {
                log.warn("Skipping demo user {}: email belongs to another tenant", d.email());
                continue;
            }
            user.setPassword(encoded);
            user.setIsActive(true);
            userRepository.save(user);
        }
        log.info("Demo clinic ready with {} demo users", DEMO_USERS.size());
    }
}
