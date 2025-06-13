package com.banking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "accounts")
public class Account {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(unique = true)
    private String accountNumber;
    
    @Enumerated(EnumType.STRING)
    private AccountType accountType = AccountType.SAVINGS;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private boolean active = true;
    
    @OneToMany(mappedBy = "fromAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> outgoingTransactions;
    
    @OneToMany(mappedBy = "toAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> incomingTransactions;
    
    // Constructors
    public Account() {}
    
    public Account(String accountNumber, AccountType accountType, User user) {
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    
    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }
    
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public List<Transaction> getOutgoingTransactions() { return outgoingTransactions; }
    public void setOutgoingTransactions(List<Transaction> outgoingTransactions) { this.outgoingTransactions = outgoingTransactions; }
    
    public List<Transaction> getIncomingTransactions() { return incomingTransactions; }
    public void setIncomingTransactions(List<Transaction> incomingTransactions) { this.incomingTransactions = incomingTransactions; }
}
