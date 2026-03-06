package com.helvino.dpms.repository;

import com.helvino.dpms.entity.Invoice;
import com.helvino.dpms.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumberAndTenantId(String invoiceNumber, Long tenantId);
    Page<Invoice> findByTenantId(Long tenantId, Pageable pageable);
    Page<Invoice> findByTenantIdAndPatientId(Long tenantId, Long patientId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.tenant.id = :tenantId AND i.invoiceDate = :date")
    BigDecimal sumRevenueByDate(@Param("tenantId") Long tenantId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.tenant.id = :tenantId AND YEAR(i.invoiceDate) = :year AND MONTH(i.invoiceDate) = :month")
    BigDecimal sumRevenueByMonth(@Param("tenantId") Long tenantId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT COALESCE(SUM(i.balance), 0) FROM Invoice i WHERE i.tenant.id = :tenantId AND i.paymentStatus IN ('PENDING', 'PARTIAL', 'OVERDUE')")
    BigDecimal sumOutstandingBalance(@Param("tenantId") Long tenantId);

    long countByTenantIdAndPaymentStatus(Long tenantId, PaymentStatus status);
}
