package com.banking.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.TransactionResponse;
import com.banking.dto.TransferRequest;
import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import com.banking.entity.TransactionType;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;

@Service
@Transactional
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private AuditService auditService;
    
    public TransactionResponse transferFunds(TransferRequest transferRequest, String username) {
        Account fromAccount = accountRepository.findByAccountNumber(transferRequest.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("From account not found"));
        
        Account toAccount = accountRepository.findByAccountNumber(transferRequest.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("To account not found"));
        
        // Verify the from account belongs to the user
        if (!fromAccount.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied: You can only transfer from your own accounts");
        }
        
        // Check if accounts are active
        if (!fromAccount.isActive() || !toAccount.isActive()) {
            throw new RuntimeException("One or both accounts are inactive");
        }
        
        // Check sufficient funds
        if (fromAccount.getBalance().compareTo(transferRequest.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }
        
        // Enhanced transfer validation and fraud checks
        validateTransferLimits(fromAccount, transferRequest.getAmount(), username);
        performFraudChecks(fromAccount, toAccount, transferRequest.getAmount(), username);
        
        // Create transaction
        Transaction transaction = new Transaction(
            fromAccount,
            toAccount,
            transferRequest.getAmount(),
            TransactionType.TRANSFER,
            transferRequest.getDescription()
        );
        
        try {
            // Update balances
            fromAccount.setBalance(fromAccount.getBalance().subtract(transferRequest.getAmount()));
            toAccount.setBalance(toAccount.getBalance().add(transferRequest.getAmount()));
            
            // Save accounts
            accountRepository.save(fromAccount);
            accountRepository.save(toAccount);
            
            // Mark transaction as completed
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setProcessedDate(LocalDateTime.now());
            
            Transaction savedTransaction = transactionRepository.save(transaction);
            
            // Log the transaction
            auditService.logAction(username, "FUND_TRANSFER", "Transaction", 
                                  savedTransaction.getId().toString(),
                                  "Transferred " + transferRequest.getAmount() + 
                                  " from " + transferRequest.getFromAccountNumber() + 
                                  " to " + transferRequest.getToAccountNumber(), null);
            
            return convertToTransactionResponse(savedTransaction);
            
        } catch (Exception e) {
            // Mark transaction as failed
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }
    }
    
    public Page<TransactionResponse> getAccountTransactions(String accountNumber, String username, Pageable pageable) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        // Verify account belongs to user
        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        Page<Transaction> transactions = transactionRepository.findByAccount(account, pageable);
        
        auditService.logAction(username, "TRANSACTION_HISTORY", "Account", 
                              account.getId().toString(),
                              "Viewed transaction history for account: " + accountNumber, null);
        
        return transactions.map(this::convertToTransactionResponse);
    }
    
    public List<TransactionResponse> getAccountTransactionsByDateRange(String accountNumber, String username,
                                                                      LocalDateTime startDate, LocalDateTime endDate) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        List<Transaction> transactions = transactionRepository.findByAccountAndDateRange(account, startDate, endDate);
        
        return transactions.stream()
                .map(this::convertToTransactionResponse)
                .collect(Collectors.toList());
    }
    
    public Page<TransactionResponse> getUserTransactions(Long userId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByUserId(userId, pageable);
        return transactions.map(this::convertToTransactionResponse);
    }

    private void validateTransferLimits(Account fromAccount, BigDecimal amount, String username) {
        // Daily transfer limit: $10,000
        BigDecimal dailyLimit = new BigDecimal("10000.00");
        if (amount.compareTo(dailyLimit) > 0) {
            auditService.logAction(username, "TRANSFER_LIMIT_EXCEEDED", "Transaction",
                                  fromAccount.getId().toString(),
                                  "Transfer amount " + amount + " exceeds daily limit of " + dailyLimit, null);
            throw new RuntimeException("Transfer amount exceeds daily limit of $" + dailyLimit);
        }

        // Single transaction limit: $5,000 for new accounts (less than 30 days old)
        if (fromAccount.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30))) {
            BigDecimal newAccountLimit = new BigDecimal("5000.00");
            if (amount.compareTo(newAccountLimit) > 0) {
                auditService.logAction(username, "NEW_ACCOUNT_LIMIT_EXCEEDED", "Transaction",
                                      fromAccount.getId().toString(),
                                      "New account transfer limit exceeded", null);
                throw new RuntimeException("New accounts are limited to $" + newAccountLimit + " per transaction");
            }
        }

        // Minimum transfer amount: $0.01
        BigDecimal minimumAmount = new BigDecimal("0.01");
        if (amount.compareTo(minimumAmount) < 0) {
            throw new RuntimeException("Minimum transfer amount is $" + minimumAmount);
        }
    }

    private void performFraudChecks(Account fromAccount, Account toAccount, BigDecimal amount, String username) {
        // Check for suspicious patterns

        // 1. Multiple large transactions in short time
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<Transaction> recentTransactions = transactionRepository
                .findByAccountAndDateRange(fromAccount, oneHourAgo, LocalDateTime.now());

        BigDecimal totalRecentAmount = recentTransactions.stream()
                .filter(t -> t.getStatus() == TransactionStatus.COMPLETED)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal hourlyLimit = new BigDecimal("15000.00");
        if (totalRecentAmount.add(amount).compareTo(hourlyLimit) > 0) {
            auditService.logAction(username, "FRAUD_ALERT_HOURLY_LIMIT", "Transaction",
                                  fromAccount.getId().toString(),
                                  "Hourly transaction limit exceeded: " + totalRecentAmount.add(amount), null);
            throw new RuntimeException("Hourly transaction limit exceeded. Please contact support.");
        }

        // 2. Round number fraud detection (amounts ending in .00 over $1000)
        if (amount.compareTo(new BigDecimal("1000.00")) > 0 &&
            amount.remainder(new BigDecimal("100")).compareTo(BigDecimal.ZERO) == 0) {
            auditService.logAction(username, "FRAUD_ALERT_ROUND_AMOUNT", "Transaction",
                                  fromAccount.getId().toString(),
                                  "Suspicious round amount: " + amount, null);
        }

        // 3. Self-transfer detection (same user different accounts)
        if (fromAccount.getUser().getId().equals(toAccount.getUser().getId()) &&
            !fromAccount.getId().equals(toAccount.getId())) {
            // Allow but log for monitoring
            auditService.logAction(username, "SELF_TRANSFER", "Transaction",
                                  fromAccount.getId().toString(),
                                  "Self-transfer between accounts", null);
        }

        // 4. Weekend large transaction alert
        if (LocalDateTime.now().getDayOfWeek().getValue() >= 6 && // Saturday or Sunday
            amount.compareTo(new BigDecimal("5000.00")) > 0) {
            auditService.logAction(username, "WEEKEND_LARGE_TRANSACTION", "Transaction",
                                  fromAccount.getId().toString(),
                                  "Large weekend transaction: " + amount, null);
        }
    }

    private TransactionResponse convertToTransactionResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setFromAccountNumber(transaction.getFromAccount() != null ? 
                                     transaction.getFromAccount().getAccountNumber() : null);
        response.setToAccountNumber(transaction.getToAccount() != null ? 
                                   transaction.getToAccount().getAccountNumber() : null);
        response.setAmount(transaction.getAmount());
        response.setTransactionType(transaction.getTransactionType());
        response.setStatus(transaction.getStatus());
        response.setDescription(transaction.getDescription());
        response.setReferenceNumber(transaction.getReferenceNumber());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setProcessedDate(transaction.getProcessedDate());
        
        return response;
    }
}
