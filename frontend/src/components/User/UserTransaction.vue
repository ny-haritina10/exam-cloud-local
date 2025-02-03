<template>
  <div class="container">
    <div class="card shadow">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="fas fa-file-invoice-dollar me-2"></i>
          Transaction Report
        </h4>
        <button @click="fetchTransactions" class="btn btn-light btn-sm" :disabled="loading">
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </button>
      </div>
      
      <div class="card-body">
        <!-- Filters -->
        <div class="row mb-4">
          <div class="col-md-5">
            <label for="dateMin" class="form-label">Start Date</label>
            <input type="date" id="dateMin" class="form-control" v-model="dateMin" />
          </div>
          <div class="col-md-5">
            <label for="dateMax" class="form-label">End Date</label>
            <input type="date" id="dateMax" class="form-control" v-model="dateMax" />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button @click="fetchTransactions" class="btn btn-primary w-100" :disabled="loading">
              <i class="fas fa-filter me-1"></i> Filter
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Fetching transactions...</p>
        </div>

        <!-- No Data State -->
        <div v-else-if="!transactions.length" class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No transactions found for the selected date range.</p>
        </div>

        <!-- Transactions Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Total Purchase</th>
                <th>Total Sale</th>
                <th>Total Amount</th>
                <th>Total Crypto Quantity</th>
                <th>Total Crypto Value</th>
                <th>First Transaction</th>
                <th>Last Transaction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.user_id">
                <td>{{ transaction.user_id }}</td>
                <td>{{ transaction.user_name }}</td>
                <td>{{ formatCurrency(transaction.total_achat) }}</td>
                <td>{{ formatCurrency(transaction.total_vente) }}</td>
                <td>{{ formatCurrency(transaction.total_amount) }}</td>
                <td>{{ transaction.total_crypto_quantity }}</td>
                <td>{{ formatCurrency(transaction.total_crypto_value) }}</td>
                <td>{{ formatDateTime(transaction.datetime_min) }}</td>
                <td>{{ formatDateTime(transaction.datetime_max) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TransactionReport",
  data() {
    return {
      dateMin: "2025-01-01",
      dateMax: "2025-10-10",
      transactions: [],
      loading: false,
    };
  },
  methods: {
    async fetchTransactions() {
      this.loading = true;
      this.transactions = [];

      const apiUrl = `http://localhost:8099/api/transactions?dateMin=${this.dateMin}&dateMax=${this.dateMax}`;
      try {
        const response = await axios.get(apiUrl);
        this.transactions = response.data;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Failed to fetch transactions. Please try again later.");
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return date.toLocaleString();
    },
  },
  mounted() {
    this.fetchTransactions();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
}

.card {
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary i {
  margin-right: 5px;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}
</style>
