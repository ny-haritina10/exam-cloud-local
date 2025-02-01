package mg.itu.service;

import mg.itu.model.Commission;
import mg.itu.repository.CommissionRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommissionService {

    @Autowired
    private CommissionRepository commissionRepository;

    public List<Commission> getAllCommissions() {
        return commissionRepository.findAll();
    }

    public Optional<Commission> getCommissionById(Long id) {
        return commissionRepository.findById(id);
    }

    public Commission saveCommission(Commission commission) {
        return commissionRepository.save(commission);
    }

    public void deleteCommissionById(Long id) {
        commissionRepository.deleteById(id);
    }
}