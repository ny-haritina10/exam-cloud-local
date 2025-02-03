<template>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3">
          <Sidebar />
        </div>
        <div class="col-md-9">
          <div class="p-4">
            <h2 class="mb-4">Tableau de bord</h2>
  
            <div class="row">
              <div class="col-md-4">
                <div class="card text-white bg-primary mb-3">
                  <div class="card-header">Solde total</div>
                  <div class="card-body">
                    <h5 class="card-title">$10,000</h5>
                  </div>
                </div>
              </div>
  
              <div class="col-md-4">
                <div class="card text-white bg-success mb-3">
                  <div class="card-header">Transactions récentes</div>
                  <div class="card-body">
                    <h5 class="card-title">+ $2,500</h5>
                  </div>
                </div>
              </div>
  
              <div class="col-md-4">
                <div class="card text-white bg-danger mb-3">
                  <div class="card-header">Dépenses</div>
                  <div class="card-body">
                    <h5 class="card-title">- $1,200</h5>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="row">
              <div class="col-md-12">
                <div class="card">
                  <div class="card-header">Évolution du marché</div>
                  <div class="card-body">
                    <canvas id="cryptoChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
  
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from "@/components/Panel/Sidebar.vue";
  import { onMounted } from "vue";
  import Chart from "chart.js/auto";
  
  export default {
    components: { Sidebar },
    setup() {
      onMounted(() => {
        new Chart(document.getElementById("cryptoChart"), {
          type: "line",
          data: {
            labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
            datasets: [
              {
                label: "Bitcoin",
                data: [40000, 42000, 39000, 45000, 47000, 46000],
                borderColor: "#f1c40f",
                borderWidth: 2,
              },
              {
                label: "Ethereum",
                data: [2500, 2700, 2300, 2900, 3100, 3000],
                borderColor: "#3498db",
                borderWidth: 2,
              },
            ],
          },
        });
      });
    },
  };
  </script>
  