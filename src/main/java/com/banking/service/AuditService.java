package com.banking.service;

import com.banking.entity.AuditLog;
import com.banking.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String username, String action, String entityType, String entityId, 
                         String details, String ipAddress) {
        AuditLog auditLog = new AuditLog(username, action, entityType, entityId, details, ipAddress);
        auditLogRepository.save(auditLog);
    }
    
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
    
    public Page<AuditLog> getAuditLogsByUsername(String username, Pageable pageable) {
        return auditLogRepository.findByUsername(username, pageable);
    }
    
    public Page<AuditLog> getAuditLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }
    
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByCreatedAtBetween(startDate, endDate);
    }
}
