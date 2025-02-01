package mg.itu.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "v_crypto_transaction_commission") 
public class CryptoTransactionCommission {

    @Id
    private Long transactionId;
    private Long idUser;
    private String userName;
    private Long idCrypto;
    private String cryptoLabel;
    private Boolean isSale;
    private Boolean isPurchase;
    private BigDecimal quantity;
    private Date dateTransaction;
    private BigDecimal cryptoPrice;
    private BigDecimal percentageSell;
    private BigDecimal percentageBuy;
    private BigDecimal commissionAmount;

    // Getters and Setters
    public Long getTransactionId() {
        return transactionId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCryptoLabel() {
        return cryptoLabel;
    }

    public void setCryptoLabel(String cryptoLabel) {
        this.cryptoLabel = cryptoLabel;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Long getIdUser() {
        return idUser;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public Long getIdCrypto() {
        return idCrypto;
    }

    public void setIdCrypto(Long idCrypto) {
        this.idCrypto = idCrypto;
    }

    public Boolean getIsSale() {
        return isSale;
    }

    public void setIsSale(Boolean isSale) {
        this.isSale = isSale;
    }

    public Boolean getIsPurchase() {
        return isPurchase;
    }

    public void setIsPurchase(Boolean isPurchase) {
        this.isPurchase = isPurchase;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public Date getDateTransaction() {
        return dateTransaction;
    }

    public void setDateTransaction(Date dateTransaction) {
        this.dateTransaction = dateTransaction;
    }

    public BigDecimal getCryptoPrice() {
        return cryptoPrice;
    }

    public void setCryptoPrice(BigDecimal cryptoPrice) {
        this.cryptoPrice = cryptoPrice;
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

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }
}