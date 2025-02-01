package mg.itu.controller;

import mg.itu.model.CryptoTransactionCommission;
import mg.itu.service.CryptoTransactionCommissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crypto_transaction_commissions")
@CrossOrigin(origins = "*")
public class CryptoTransactionCommissionController {

    private final CryptoTransactionCommissionService service;

    public CryptoTransactionCommissionController(CryptoTransactionCommissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<CryptoTransactionCommission> getAllCommissions() {
        return service.getAllCommissions();
    }
}
