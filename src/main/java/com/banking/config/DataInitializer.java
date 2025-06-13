package com.banking.config;

import com.banking.entity.AccountType;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@banking.com");
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhoneNumber("1234567890");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            
            System.out.println("Admin user created: username=admin, password=admin123");
        }
        
        // Create demo user if not exists
        if (!userRepository.existsByUsername("demo")) {
            User demoUser = new User();
            demoUser.setUsername("demo");
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setEmail("demo@banking.com");
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser.setPhoneNumber("9876543210");
            demoUser.setRole(Role.USER);
            User savedUser = userRepository.save(demoUser);
            
            // Create demo accounts
            var savingsAccount = accountService.createAccount(savedUser.getId(), AccountType.SAVINGS);
            var checkingAccount = accountService.createAccount(savedUser.getId(), AccountType.CHECKING);
            
            // Add some initial balance
            accountService.depositFunds(savingsAccount.getAccountNumber(), new BigDecimal("5000.00"), "demo");
            accountService.depositFunds(checkingAccount.getAccountNumber(), new BigDecimal("2500.00"), "demo");
            
            System.out.println("Demo user created: username=demo, password=demo123");
            System.out.println("Demo accounts created with initial balances");
        }
    }
}
