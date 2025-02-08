<template> 
  <div class="container mt-4">
    <div class="card shadow-lg rounded">
      <!-- Card Header -->
      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 px-4">
        <h4 class="mb-0">
          <i class="fas fa-wallet me-2"></i> Transactions
        </h4>
        <button 
          @click="fetchTransactions" 
          class="btn btn-light btn-sm"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </button>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <div v-if="loading" class="text-center my-4">
          <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p>Loading transactions...</p>
        </div>

        <div v-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i> {{ error }}
        </div>

        <table v-if="transactions.length > 0" class="table table-hover table-bordered text-center">
          <thead class="table-dark">
            <tr>
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
              <td>{{ transaction.userId }}</td>
              <td class="text-success fw-bold">
                <i class="fas fa-arrow-up"></i> ${{ transaction.deposit.toFixed(2) }}
              </td>
              <td class="text-danger fw-bold">
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
                <button v-if="!transaction.approvedByAdmin" @click="validateTransaction(transaction.id, transaction.userId)" 
                  class="btn btn-sm btn-primary">
                  <i class="fas fa-check"></i> Validate
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else-if="!loading && transactions.length === 0" class="text-center my-4">
          <i class="fas fa-box-open fa-2x text-muted"></i>
          <p>No transactions found.</p>
        </div>
      </div>
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
      adminId: localStorage.getItem('id_admin'),
    };
  },
  methods: {
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
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
    async validateTransaction(transactionId, userId) {
      try {
        // Validate transaction
        const response = await axios.get(`http://localhost:8099/front-office/api/transactions/validate?transactionId=${transactionId}&adminId=${this.adminId}`);
        const updatedTransaction = response.data.data;
        this.transactions = this.transactions.map(transaction =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        );

        // Send notification after validation
        await this.sendNotification(userId, transactionId);

      } catch (error) {
        this.error = "Failed to validate transaction. Please try again.";
      }
    },
    async sendNotification(userId, transactionId) {
      console.log('notifications');
      try {
        await axios.post('http://localhost:3000/notify', {
          userId,
          transactionId,
        });
        console.log("Notification sent successfully.");
      } catch (error) {
        console.error("Error sending notification:", error);
        this.error = "Failed to send notification. Please try again.";
      }
    }
  },
  mounted() {
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
}

/* Header */
.card-header {
  border-bottom: 2px solid #dee2e6;
}

/* Badges */
.badge {
  font-size: 14px;
  padding: 8px;
}

/* Buttons */
.btn {
  transition: all 0.3s ease-in-out;
}

.btn:hover:not(:disabled) {
  transform: scale(1.05);
}
</style>