package com.banking.controller;

import com.banking.dto.AccountResponse;
import com.banking.entity.Account;
import com.banking.entity.AccountType;
import com.banking.entity.User;
import com.banking.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/accounts")
public class AccountController {
    
    @Autowired
    private AccountService accountService;
    
    @PostMapping("/create")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createAccount(@RequestParam AccountType accountType,
                                         Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Account account = accountService.createAccount(user.getId(), accountType);
            return ResponseEntity.ok().body("Account created successfully with number: " + account.getAccountNumber());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-accounts")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getMyAccounts(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<AccountResponse> accounts = accountService.getUserAccounts(user.getId());
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{accountNumber}/balance")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAccountBalance(@PathVariable String accountNumber,
                                             Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            AccountResponse account = accountService.getAccountBalance(accountNumber, user.getUsername());
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{accountNumber}/deposit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> depositFunds(@PathVariable String accountNumber,
                                        @RequestParam BigDecimal amount,
                                        Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Account account = accountService.depositFunds(accountNumber, amount, user.getUsername());
            return ResponseEntity.ok().body("Deposit successful. New balance: $" + account.getBalance());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{accountNumber}/withdraw")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> withdrawFunds(@PathVariable String accountNumber,
                                         @RequestParam BigDecimal amount,
                                         Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Account account = accountService.withdrawFunds(accountNumber, amount, user.getUsername());
            return ResponseEntity.ok().body("Withdrawal successful. New balance: $" + account.getBalance());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
