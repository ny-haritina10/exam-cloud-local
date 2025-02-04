package mg.itu.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_user", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double deposit;

    @Column(nullable = false)
    private Double withdrawal;

    @Column(name = "date_transaction", nullable = false)
    private LocalDateTime dateTransaction;

    @Column(name = "approved_by_admin")
    private boolean approvedByAdmin = false;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    // Getters and Setters
    public Long getId() 
    { return id; }

    public void setId(Long id) 
    { this.id = id; }

    public Long getUserId() 
    { return userId; }

    public void setUserId(Long userId) 
    { this.userId = userId; }

    public Double getDeposit() 
    { return deposit; }

    public void setDeposit(Double deposit) 
    { this.deposit = deposit; }

    public Double getWithdrawal() 
    { return withdrawal; }

    public void setWithdrawal(Double withdrawal) 
    { this.withdrawal = withdrawal; }

    public LocalDateTime getDateTransaction() 
    { return dateTransaction; }

    public void setDateTransaction(LocalDateTime dateTransaction) 
    { this.dateTransaction = dateTransaction; }

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }

    public boolean isApprovedByAdmin() {
        return approvedByAdmin;
    }

    public void setApprovedByAdmin(boolean approvedByAdmin) {
        this.approvedByAdmin = approvedByAdmin;
    }
}