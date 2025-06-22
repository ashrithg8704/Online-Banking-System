package com.banking.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.banking.entity.AccountType;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;

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
        try {
            System.out.println("Starting data initialization...");

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

                System.out.println("✅ Admin user created: username=admin, password=admin123");
            } else {
                System.out.println("✅ Admin user already exists");
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

                System.out.println("✅ Demo user created: username=demo, password=demo123");
                System.out.println("✅ Demo accounts created with initial balances");
            } else {
                System.out.println("✅ Demo user already exists");
            }

            System.out.println("✅ Data initialization completed successfully");

        } catch (Exception e) {
            System.err.println("❌ Error during data initialization: " + e.getMessage());
            e.printStackTrace();
            // Don't throw the exception - let the app start even if data init fails
        }
    }
}
