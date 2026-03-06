package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Appointment;
import com.helvino.dpms.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByTenantIdAndAppointmentDate(Long tenantId, LocalDate date);
    List<Appointment> findByTenantIdAndDentistIdAndAppointmentDate(Long tenantId, Long dentistId, LocalDate date);
    Page<Appointment> findByTenantId(Long tenantId, Pageable pageable);
    Page<Appointment> findByTenantIdAndPatientId(Long tenantId, Long patientId, Pageable pageable);
    long countByTenantIdAndAppointmentDate(Long tenantId, LocalDate date);
    long countByTenantIdAndStatus(Long tenantId, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.tenant.id = :tenantId AND a.appointmentDate BETWEEN :start AND :end ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findByTenantIdAndDateRange(@Param("tenantId") Long tenantId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
