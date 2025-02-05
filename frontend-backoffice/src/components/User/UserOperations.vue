<template>
  <div class="container">
    <div class="card shadow">
      <!-- Card Header -->
      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="fas fa-history me-2"></i> Crypto Transactions History
        </h4>
        <button @click="refreshTransactions" class="btn btn-light btn-sm" :disabled="loading">
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
      </div>

      <div class="card-body">
        <!-- Filters -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label"><i class="fas fa-user"></i> Filter by User</label>
            <select v-model="selectedUser" class="form-select" @change="applyFilters">
              <option value="">All Users</option>
              <option v-for="user in uniqueUsers" :key="user" :value="user">{{ user }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label"><i class="fas fa-coins"></i> Filter by Cryptocurrency</label>
            <select v-model="selectedCrypto" class="form-select" @change="applyFilters">
              <option value="">All Cryptos</option>
              <option v-for="crypto in uniqueCryptos" :key="crypto" :value="crypto">{{ crypto }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Loading transactions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i> {{ error }}
        </div>

        <!-- No Data State -->
        <div v-else-if="!filteredTransactions.length" class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No transactions found</p>
        </div>

        <!-- Transactions Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th><i class="fas fa-user me-1"></i> User ID</th>
                <th><i class="fas fa-user-circle me-1"></i> User Name</th>
                <th><i class="fas fa-coins me-1"></i> Cryptocurrency</th>
                <th><i class="fas fa-calculator me-1"></i> Quantity</th>
                <th><i class="fas fa-exchange-alt me-1"></i> Type</th>
                <th><i class="fas fa-calendar-alt me-1"></i> Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transaction, index) in filteredTransactions" :key="index" @click="filterByUser(transaction.userName)">
                <td>{{ transaction.userId }}</td>
                <td>{{ transaction.userName }}</td>
                <td><span class="fw-medium">{{ transaction.cryptoLabel }}</span></td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ formatQuantity(transaction.quantity) }}
                  </span>
                </td>
                <td>
                  <span :class="`badge ${transaction.isPurchase ? 'bg-success' : 'bg-danger'}`">
                    <i :class="`fas fa-${transaction.isPurchase ? 'shopping-cart' : 'cash-register'} me-1`"></i>
                    {{ transaction.isPurchase ? 'Purchase' : 'Sale' }}
                  </span>
                </td>
                <td>{{ formatDate(transaction.dateTransaction) }}</td>
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
  name: 'CryptoTransactionsList',
  data() {
    return {
      transactions: [],
      filteredTransactions: [],
      loading: false,
      error: null,
      selectedUser: '',
      selectedCrypto: '',
    };
  },
  computed: {
    uniqueUsers() {
      return [...new Set(this.transactions.map(t => t.userName))].sort();
    },
    uniqueCryptos() {
      return [...new Set(this.transactions.map(t => t.cryptoLabel))].sort();
    }
  },
  methods: {
    formatQuantity(value) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(value);
    },
    formatDate(date) {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    async fetchTransactions() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('http://localhost:8099/front-office/api/crypto-transactions/all');
        this.transactions = response.data;
        this.filteredTransactions = [...this.transactions]; // Initialize filtered data
      } catch (error) {
        this.error = 'Failed to load transactions. Please try again later.';
        console.error('Error fetching transactions:', error);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.filteredTransactions = this.transactions.filter(transaction => {
        return (
          (this.selectedUser === '' || transaction.userName === this.selectedUser) &&
          (this.selectedCrypto === '' || transaction.cryptoLabel === this.selectedCrypto)
        );
      });
    },
    filterByUser(userName) {
      this.selectedUser = userName;
      this.applyFilters();
    },
    refreshTransactions() {
      this.fetchTransactions();
    }
  },
  created() {
    this.fetchTransactions();
  }
};
</script>

<style scoped>
/* Card */
.card {
  border-radius: 12px;
  overflow: hidden;
}

/* Table */
.table {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
}

/* Filters */
.form-select {
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.form-select:focus {
  border-color: #6c757d;
  box-shadow: 0px 0px 5px rgba(108, 117, 125, 0.5);
}

/* Buttons */
.btn {
  transition: all 0.3s ease-in-out;
}

.btn:hover:not(:disabled) {
  transform: scale(1.05);
}
</style>