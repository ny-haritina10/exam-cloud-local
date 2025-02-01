package mg.itu.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "commission")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "percentage_sell", nullable = false)
    private BigDecimal percentageSell;

    @Column(name = "percentage_buy", nullable = false)
    private BigDecimal percentageBuy;

    @Column(name = "date_reference", nullable = false)
    private Date dateReference;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPercentageSell() {
        return percentageSell;
    }

    public void setPercentageSell(BigDecimal percentageSell) {
        this.percentageSell = percentageSell;
    }

    public BigDecimal getPercentageBuy() {
        return percentageBuy;
    }

    public void setPercentageBuy(BigDecimal percentageBuy) {
        this.percentageBuy = percentageBuy;
    }

    public Date getDateReference() {
        return dateReference;
    }

    public void setDateReference(Date dateReference) {
        this.dateReference = dateReference;
    }
}