<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">
      <i class="fas fa-wallet"></i> Transactions
    </h2>
    
    <div v-if="loading" class="text-center">
      <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
      <p>Loading transactions...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <table v-if="transactions.length > 0" class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>User ID</th>
          <th>Deposit</th>
          <th>Withdrawal</th>
          <th>Date</th>
          <th>Status</th>
          <th>Validated At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>{{ transaction.id }}</td>
          <td>{{ transaction.userId }}</td>
          <td class="text-success">
            <i class="fas fa-arrow-up"></i> ${{ transaction.deposit.toFixed(2) }}
          </td>
          <td class="text-danger">
            <i class="fas fa-arrow-down"></i> ${{ transaction.withdrawal.toFixed(2) }}
          </td>
          <td>{{ formatDate(transaction.dateTransaction) }}</td>
          <td>
            <span v-if="transaction.approvedByAdmin" class="badge bg-success">
              <i class="fas fa-check-circle"></i> Approved
            </span>
            <span v-else class="badge bg-warning text-dark">
              <i class="fas fa-hourglass-half"></i> Pending
            </span>
          </td>
          <td>
            {{ transaction.validatedAt ? formatDate(transaction.validatedAt) : 'Not validated' }}
          </td>
          <td>
            <button v-if="!transaction.approvedByAdmin" @click="validateTransaction(transaction.id)" class="btn btn-primary">
              <i class="fas fa-check"></i> Validate
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading && transactions.length === 0" class="text-center">
      <i class="fas fa-box-open fa-2x text-muted"></i>
      <p>No transactions found.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      transactions: [],
      loading: true,
      error: null,
      adminId: 1 
      error: null
    };
  },
  methods: {
    async fetchTransactions() {
      try {
        const response = await axios.get('http://localhost:8099/front-office/api/transactions/all');
        this.transactions = response.data.data || [];
      } catch (err) {
        this.error = "Failed to load transactions. Please try again later.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
    async validateTransaction(transactionId) {
      try {
        const response = await axios.get(`http://localhost:8099/front-office/api/transactions/validate?transactionId=${transactionId}&adminId=${this.adminId}`);
        const updatedTransaction = response.data.data;
        this.transactions = this.transactions.map(transaction =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        );
      } catch (error) {
        this.error = "Failed to validate transaction. Please try again.";
      }
    }
  },
  mounted() {
    this.fetchTransactions();
  }
};
</script>

<style scoped>
.table {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

th {
  text-align: center;
}

td {
  text-align: center;
  vertical-align: middle;
}

.badge {
  font-size: 14px;
  padding: 8px;
}
</style>
