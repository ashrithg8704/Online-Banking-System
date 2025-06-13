package com.banking.service;

import com.banking.dto.AccountResponse;
import com.banking.entity.Account;
import com.banking.entity.AccountType;
import com.banking.entity.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class AccountService {
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuditService auditService;
    
    public Account createAccount(Long userId, AccountType accountType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String accountNumber = generateAccountNumber();
        Account account = new Account(accountNumber, accountType, user);
        
        Account savedAccount = accountRepository.save(account);
        auditService.logAction(user.getUsername(), "ACCOUNT_CREATED", "Account", 
                              savedAccount.getId().toString(), 
                              "Account created: " + accountNumber, null);
        
        return savedAccount;
    }
    
    public List<AccountResponse> getUserAccounts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Account> accounts = accountRepository.findByUserAndActiveTrue(user);
        return accounts.stream()
                .map(this::convertToAccountResponse)
                .collect(Collectors.toList());
    }
    
    public Optional<Account> findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber);
    }
    
    public AccountResponse getAccountBalance(String accountNumber, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        // Check if the account belongs to the user
        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        auditService.logAction(username, "BALANCE_INQUIRY", "Account", 
                              account.getId().toString(), 
                              "Balance inquiry for account: " + accountNumber, null);
        
        return convertToAccountResponse(account);
    }
    
    public Account depositFunds(String accountNumber, BigDecimal amount, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        account.setBalance(account.getBalance().add(amount));
        Account savedAccount = accountRepository.save(account);
        
        auditService.logAction(username, "DEPOSIT", "Account", 
                              account.getId().toString(), 
                              "Deposited " + amount + " to account: " + accountNumber, null);
        
        return savedAccount;
    }
    
    public Account withdrawFunds(String accountNumber, BigDecimal amount, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }
        
        account.setBalance(account.getBalance().subtract(amount));
        Account savedAccount = accountRepository.save(account);
        
        auditService.logAction(username, "WITHDRAWAL", "Account", 
                              account.getId().toString(), 
                              "Withdrew " + amount + " from account: " + accountNumber, null);
        
        return savedAccount;
    }
    
    private String generateAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "ACC" + String.format("%010d", new Random().nextInt(1000000000));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        
        return accountNumber;
    }
    
    private AccountResponse convertToAccountResponse(Account account) {
        return new AccountResponse(
            account.getId(),
            account.getAccountNumber(),
            account.getAccountType(),
            account.getBalance(),
            account.getCreatedAt(),
            account.isActive()
        );
    }
}
