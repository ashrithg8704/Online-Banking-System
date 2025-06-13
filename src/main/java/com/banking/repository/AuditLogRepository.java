package com.banking.repository;

import com.banking.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUsername(String username, Pageable pageable);
    List<AuditLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    Page<AuditLog> findByAction(String action, Pageable pageable);
}
