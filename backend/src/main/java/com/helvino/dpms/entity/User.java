package com.helvino.dpms.entity;

import com.helvino.dpms.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String profileImage;
    private String specialization;
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private Boolean isActive = true;
    private Boolean twoFactorEnabled = false;
    private String twoFactorSecret;
    private LocalDateTime lastLogin;
    private LocalDateTime passwordChangedAt;

    @OneToMany(mappedBy = "dentist", fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
