package com.banking.repository;

import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount = :account OR t.toAccount = :account) ORDER BY t.transactionDate DESC")
    Page<Transaction> findByAccount(@Param("account") Account account, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount = :account OR t.toAccount = :account) " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByAccountAndDateRange(@Param("account") Account account, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    List<Transaction> findByStatus(TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId) " +
           "ORDER BY t.transactionDate DESC")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
