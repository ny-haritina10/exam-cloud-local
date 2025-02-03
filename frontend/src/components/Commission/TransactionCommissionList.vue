<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="fas fa-hand-holding-usd me-2"></i>
          Crypto Transaction Commissions
        </h4>
      </div>
      <div class="card-body">
        <!-- Crypto Filter Dropdown -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="cryptoFilter" class="form-label">Filter by Crypto:</label>
            <select id="cryptoFilter" class="form-select" v-model="selectedCrypto">
              <option value="">All Cryptos</option>
              <option v-for="crypto in cryptos" :key="crypto.id" :value="crypto.id">
                {{ crypto.label }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label for="analysisType" class="form-label">Analysis Type:</label>
            <select id="analysisType" class="form-select" v-model="selectedAnalysis">
              <option value="">None</option>
              <option value="sum">Sum</option>
              <option value="average">Average</option>
            </select>
          </div>
        </div>

        <!-- Display Analysis Result -->
        <div v-if="selectedAnalysis" class="alert alert-info">
          <strong>Analysis Result:</strong>
          <span v-if="selectedAnalysis === 'sum'">
            Total Commission: ${{ analysisResult.toFixed(2) }}
          </span>
          <span v-else-if="selectedAnalysis === 'average'">
            Average Commission: ${{ analysisResult.toFixed(2) }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <!-- No Data State -->
        <div v-else-if="!filteredTransactions.length" class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No commission transactions found</p>
        </div>

        <!-- Table to display commission transactions -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Crypto</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Crypto Price ($)</th>
                <th>Commission (%)</th>
                <th>Commission Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction.transactionId">
                <td>{{ transaction.transactionId }}</td>
                <td>{{ transaction.userName }}</td>
                <td>{{ transaction.cryptoLabel }}</td>
                <td>
                  <span :class="`badge ${transaction.isSale ? 'bg-danger' : 'bg-success'}`">
                    {{ transaction.isSale ? 'Sale' : 'Purchase' }}
                  </span>
                </td>
                <td>{{ transaction.quantity }}</td>
                <td>{{ formatDate(transaction.dateTransaction) }}</td>
                <td>{{ transaction.cryptoPrice.toFixed(2) }}</td>
                <td>{{ transaction.isSale ? transaction.percentageSell.toFixed(2) : transaction.percentageBuy.toFixed(2) }}%</td>
                <td>{{ transaction.commissionAmount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TransactionCommissionList',
  data() {
    return {
      transactions: [],
      cryptos: [],
      selectedCrypto: "",
      selectedAnalysis: "",
      loading: true,
      error: null
    };
  },
  computed: {
    filteredTransactions() {
      if (!this.selectedCrypto) {
        return this.transactions;
      }
      return this.transactions.filter(transaction => transaction.idCrypto === this.selectedCrypto);
    },
    analysisResult() {
      const transactions = this.filteredTransactions;
      if (transactions.length === 0) return 0;

      const totalCommission = transactions.reduce((sum, t) => sum + t.commissionAmount, 0);
      return this.selectedAnalysis === "sum" ? totalCommission : totalCommission / transactions.length;
    }
  },
  methods: {
    async fetchTransactions() {
      try {
        const response = await axios.get('http://localhost:8099/front-office/api/crypto_transaction_commissions');
        this.transactions = response.data;
      } catch (err) {
        this.error = 'Failed to load data. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    async fetchCryptos() {
      try {
        const response = await fetch("http://localhost:8099/front-office/api/crypto-transactions/cryptos");
        this.cryptos = await response.json();
      } catch (err) {
        console.error('Error fetching cryptos:', err);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  },
  mounted() {
    this.fetchTransactions();
    this.fetchCryptos();
  }
};
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
