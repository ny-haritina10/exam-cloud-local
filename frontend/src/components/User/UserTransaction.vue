<template>
  <div class="transaction-report-container">
    <h2>Transaction Report</h2>
    
    <!-- Date Range Filter -->
    <div class="filter-container">
      <div>
        <label for="dateMin">Start Date</label>
        <input type="date" id="dateMin" v-model="dateMin" />
      </div>
      <div>
        <label for="dateMax">End Date</label>
        <input type="date" id="dateMax" v-model="dateMax" />
      </div>
      <div>
        <button 
          @click="fetchTransactions" 
          :disabled="loading" 
          class="btn-primary"
        >
          <span v-if="!loading">Filter</span>
          <span v-else class="loading-spinner">Loading...</span>
        </button>
      </div>
    </div>

    <!-- Transaction Table -->
    <div v-if="transactions.length" class="table-container">
      <table>
        <thead>
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
    
    <div v-else-if="!loading" class="alert-warning">
      No transactions found for the selected date range.
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
.transaction-report-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-container > div {
  display: flex;
  flex-direction: column;
}

input[type="date"] {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 5px;
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table th,
table td {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
}

table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}
</style>