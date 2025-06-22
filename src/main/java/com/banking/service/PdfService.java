package com.banking.service;

import com.banking.dto.TransactionResponse;
import com.banking.entity.Account;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private TransactionService transactionService;
    
    public byte[] generateAccountStatement(String accountNumber, String username, 
                                         LocalDateTime startDate, LocalDateTime endDate) {
        try {
            Account account = accountService.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            
            // Verify account belongs to user
            if (!account.getUser().getUsername().equals(username)) {
                throw new RuntimeException("Access denied");
            }
            
            List<TransactionResponse> transactions = transactionService
                    .getAccountTransactionsByDateRange(accountNumber, username, startDate, endDate);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Header
            document.add(new Paragraph("ONLINE BANKING SYSTEM")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(20)
                    .setBold());
            
            document.add(new Paragraph("Account Statement")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setBold());
            
            // Account Information
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Account Holder: " + account.getUser().getFirstName() + 
                                     " " + account.getUser().getLastName()));
            document.add(new Paragraph("Account Number: " + account.getAccountNumber()));
            document.add(new Paragraph("Account Type: " + account.getAccountType()));
            document.add(new Paragraph("Current Balance: $" + account.getBalance()));
            document.add(new Paragraph("Statement Period: " + 
                                     startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + 
                                     " to " + 
                                     endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))));
            
            // Transaction Table
            document.add(new Paragraph("\nTransaction History:").setBold());
            
            if (transactions.isEmpty()) {
                document.add(new Paragraph("No transactions found for the specified period."));
            } else {
                Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 2, 3, 2}));
                table.setWidth(UnitValue.createPercentValue(100));
                
                // Table headers
                table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Type").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("From Account").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("To Account").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));
                
                // Table data
                for (TransactionResponse transaction : transactions) {
                    table.addCell(new Cell().add(new Paragraph(
                            transaction.getTransactionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))));
                    table.addCell(new Cell().add(new Paragraph(transaction.getTransactionType().toString())));
                    table.addCell(new Cell().add(new Paragraph(
                            transaction.getFromAccountNumber() != null ? transaction.getFromAccountNumber() : "-")));
                    table.addCell(new Cell().add(new Paragraph(
                            transaction.getToAccountNumber() != null ? transaction.getToAccountNumber() : "-")));
                    table.addCell(new Cell().add(new Paragraph(
                            transaction.getDescription() != null ? transaction.getDescription() : "-")));
                    
                    // Color code amounts (red for outgoing, green for incoming)
                    String amountText = "$" + transaction.getAmount().toString();
                    if (transaction.getFromAccountNumber() != null && 
                        transaction.getFromAccountNumber().equals(accountNumber)) {
                        amountText = "-" + amountText;
                    } else {
                        amountText = "+" + amountText;
                    }
                    table.addCell(new Cell().add(new Paragraph(amountText)));
                }
                
                document.add(table);
            }
            
            // Footer
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Generated on: " + 
                                     LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(10));
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF statement: " + e.getMessage());
        }
    }
}
