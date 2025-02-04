package mg.itu.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import mg.itu.service.TransactionService;
import mg.itu.model.Transaction;
import mg.itu.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/front-office/api/transactions")
@CrossOrigin(origins = "*")  
public class TransactionController {

    @Autowired
    private TransactionService service;

    @PostMapping
    public ResponseEntity<ApiResponse<Transaction>> createTransaction(@RequestBody Transaction transaction) {
        Transaction savedTransaction = service.saveTransaction(transaction);
        ApiResponse<Transaction> response = new ApiResponse<>("success", "Transaction created successfully. Pending admin approval.", savedTransaction);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Transaction>> validateTransaction(
            @RequestParam Long transactionId,
            @RequestParam Long adminId) 
    {
        Transaction validatedTransaction = service.approveTransaction(transactionId, adminId);
        ApiResponse<Transaction> response = new ApiResponse<>(
            "success",
            "Transaction validated successfully",
            validatedTransaction
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Transaction>>> getAllTransactions() {
        List<Transaction> transactions = service.getAllTransactions();
        ApiResponse<List<Transaction>> response = new ApiResponse<>("success", "All transactions retrieved successfully", transactions);
        
        return ResponseEntity.ok(response);
    }
}