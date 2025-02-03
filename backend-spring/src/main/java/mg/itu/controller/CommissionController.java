package mg.itu.controller;

import mg.itu.model.Commission;
import mg.itu.service.CommissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/front-office/api/commissions")
@CrossOrigin(origins = "*")
public class CommissionController {

    @Autowired
    private CommissionService commissionService;

    @GetMapping
    public List<Commission> getAllCommissions() {
        return commissionService.getAllCommissions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commission> getCommissionById(@PathVariable Long id) {
        return commissionService.getCommissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Commission createCommission(@RequestBody Commission commission) {
        return commissionService.saveCommission(commission);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Commission> updateCommission(@PathVariable Long id, @RequestBody Commission commissionDetails) {
        return commissionService.getCommissionById(id)
                .map(commission -> {
                    commission.setPercentageSell(commissionDetails.getPercentageSell());
                    commission.setPercentageBuy(commissionDetails.getPercentageBuy());
                    commission.setDateReference(commissionDetails.getDateReference());
                    return ResponseEntity.ok(commissionService.saveCommission(commission));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommission(@PathVariable Long id) {
        if (commissionService.getCommissionById(id).isPresent()) {
            commissionService.deleteCommissionById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}