<template>
  <div class="container mt-4">
    <h2>Crypto Transaction Commissions</h2>

    <!-- Crypto Filter Dropdown -->
    <div class="mb-3">
      <label for="cryptoFilter" class="form-label">Filter by Crypto:</label>
      <select id="cryptoFilter" class="form-select" v-model="selectedCrypto">
        <option value="">All Cryptos</option>
        <option v-for="crypto in cryptos" :key="crypto.id" :value="crypto.id">
          {{ crypto.label }}
        </option>
      </select>
    </div>

    <!-- Analysis Type Dropdown -->
    <div class="mb-3">
      <label for="analysisType" class="form-label">Analysis Type:</label>
      <select id="analysisType" class="form-select" v-model="selectedAnalysis">
        <option value="">None</option>
        <option value="sum">Sum</option>
        <option value="average">Average</option>
      </select>
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

    <!-- Show loader while data is being fetched -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Show error if API fails -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Table to display commission transactions -->
    <table v-if="!loading && !error" class="table table-striped">
      <thead>
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
            <span v-if="transaction.isSale" class="badge bg-danger">Sale</span>
            <span v-else-if="transaction.isPurchase" class="badge bg-success">Purchase</span>
          </td>
          <td>{{ transaction.quantity }}</td>
          <td>{{ formatDate(transaction.dateTransaction) }}</td>
          <td>{{ transaction.cryptoPrice.toFixed(2) }}</td>
          <td>
            <span v-if="transaction.isSale">{{ transaction.percentageSell.toFixed(2) }}%</span>
            <span v-else-if="transaction.isPurchase">{{ transaction.percentageBuy.toFixed(2) }}%</span>
          </td>
          <td>{{ transaction.commissionAmount.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
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
    // Filter transactions based on selected cryptocurrency
    filteredTransactions() {
      if (!this.selectedCrypto) {
        return this.transactions; // Show all if no filter selected
      }
      return this.transactions.filter(transaction => transaction.idCrypto === this.selectedCrypto);
    },
    
    // Compute Sum or Average based on selected analysis type
    analysisResult() {
      const transactions = this.filteredTransactions;
      if (transactions.length === 0) return 0;

      const totalCommission = transactions.reduce((sum, t) => sum + t.commissionAmount, 0);

      if (this.selectedAnalysis === "sum") {
        return totalCommission;
      } else if (this.selectedAnalysis === "average") {
        return totalCommission / transactions.length;
      }
      return 0;
    }
  },
  methods: {
    async fetchTransactions() {
      try {
        const response = await axios.get('http://localhost:8099/api/crypto_transaction_commissions');
        this.transactions = response.data;
      } catch (err) {
        this.error = 'Failed to load data. Please try again later.';
        console.error('Error fetching transactions:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchCryptos() {
      try {
        const response = await fetch("http://localhost:8099/api/crypto-transactions/cryptos");
        this.cryptos = await response.json();
      } catch (err) {
        console.error('Error fetching cryptos:', err);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
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
  max-width: 900px;
}
.table {
  margin-top: 20px;
}
</style>