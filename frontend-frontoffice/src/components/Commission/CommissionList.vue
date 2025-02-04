<template>
  <div class="container mt-5">
    <h2>Commissions</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Percentage Sell</th>
          <th>Percentage Buy</th>
          <th>Date Reference</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="commission in commissions" :key="commission.id">
          <td>{{ commission.id }}</td>
          <td>{{ commission.percentageSell }}%</td>
          <td>{{ commission.percentageBuy }}%</td>
          <td>{{ formatDate(commission.dateReference) }}</td>
          <td>
            <button class="btn btn-primary" @click="editCommission(commission)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal for editing -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Commission</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="percentageSell" class="form-label">Percentage Sell</label>
                <input type="text" class="form-control" id="percentageSell" v-model="editingCommission.percentageSell">
              </div>
              <div class="mb-3">
                <label for="percentageBuy" class="form-label">Percentage Buy</label>
                <input type="text" class="form-control" id="percentageBuy" v-model="editingCommission.percentageBuy">
              </div>
              <div class="mb-3">
                <label for="dateReference" class="form-label">Date Reference</label>
                <input type="date" class="form-control" id="dateReference" v-model="editingCommission.dateReference">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="updateCommission">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'CommissionList',
  data() {
    return {
      commissions: [],
      editingCommission: {
        id: null,
        percentageSell: '',
        percentageBuy: '',
        dateReference: ''
      }
    };
  },
  methods: {
    async fetchCommissions() {
      try {
        const response = await axios.get('http://localhost:8099/front-office/api/commissions');
        this.commissions = response.data;
      } catch (error) {
        console.error('Error fetching commissions:', error);
      }
    },
    editCommission(commission) {
      this.editingCommission = { ...commission };
      const date = new Date(this.editingCommission.dateReference);
      this.editingCommission.dateReference = date.toISOString().split('T')[0];

      const modalElement = document.getElementById('editModal');
      console.log(document.getElementById('editModal'));
      const modal = new Modal(modalElement);
      modal.show();
    },
    async updateCommission() {
      try {
        const response = await axios.put(
          `http://localhost:8099/front-office/api/commissions/${this.editingCommission.id}`,
          this.editingCommission
        );

        if (response.status === 200) {
          this.fetchCommissions(); // Refresh data
          
          // Close the modal
          const modalElement = document.getElementById('editModal');
          if (modalElement) {
            const modalInstance = Modal.getInstance(modalElement) || new Modal(modalElement);
            modalInstance.hide();
          }
        }
      } catch (error) {
        console.error('Error updating commission:', error);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  },
  mounted() {
    this.fetchCommissions();
  }
};
</script>