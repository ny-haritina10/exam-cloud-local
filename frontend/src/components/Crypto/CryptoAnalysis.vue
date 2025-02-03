<template>
  <div class="container py-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="fas fa-chart-line me-2"></i>
          Crypto Price Analysis
        </h4>
        <button @click="fetchAndAnalyze" class="btn btn-light btn-sm">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>

      <div class="card-body">
        <!-- Filters -->
        <div class="row mb-4">
          <div class="col-md-4">
            <label for="analysisType" class="form-label">Analysis Type</label>
            <select id="analysisType" class="form-select" v-model="selectedAnalysis">
              <option value="quartile1">1er Quartile</option>
              <option value="maxMin">Max and Min</option>
              <option value="moyenne">Moyenne</option>
              <option value="ecartType">Écart-Type</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="startDate" class="form-label">Start Date</label>
            <input type="datetime-local" id="startDate" class="form-control" v-model="startDate" />
          </div>
          <div class="col-md-4">
            <label for="endDate" class="form-label">End Date</label>
            <input type="datetime-local" id="endDate" class="form-control" v-model="endDate" />
          </div>
        </div>

        <!-- Crypto Selection -->
        <div class="row mb-3">
          <div class="col-12">
            <label class="form-label">Filter by Cryptos</label>
            <div class="d-flex flex-wrap">
              <div v-for="crypto in cryptos" :key="crypto.id" class="form-check me-3">
                <input type="checkbox" class="form-check-input" :id="'crypto' + crypto.id" :value="crypto.id" v-model="selectedCryptos" />
                <label class="form-check-label" :for="'crypto' + crypto.id">{{ crypto.label }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mt-4">
          <button class="btn btn-primary me-2" @click="fetchAndAnalyze">
            <i class="fas fa-play me-1"></i> Analyze
          </button>
          <button class="btn btn-secondary" @click="toggleSelectAll">
            <i class="fas fa-check-double me-1"></i> {{ selectAllButtonText }}
          </button>
        </div>
      </div>

      <!-- Analysis Results -->
      <div class="card-footer">
        <div v-if="analysisResults.length" class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-light">
              <tr>
                <th>Crypto</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in analysisResults" :key="result.cryptoId">
                <td>{{ result.cryptoLabel }}</td>
                <td>{{ result.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-muted py-3">
          <i class="fas fa-info-circle me-1"></i> No results to display. Select cryptos and click "Analyze".
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      cryptoData: [], 
      cryptos: [], 
      selectedAnalysis: "quartile1", 
      selectedCryptos: [], 
      startDate: null, 
      endDate: null, 
      analysisResults: [], 
    };
  },
  computed: {
    selectAllButtonText() {
      return this.selectedCryptos.length === this.cryptos.length ? "Deselect All" : "Select All";
    }
  },
  methods: {
    async fetchCryptoData() {
      this.cryptoData = []; 

      // Fetch data for each selected crypto
      for (const cryptoId of this.selectedCryptos) {
        const response = await fetch(
          `http://localhost:8099/api/crypto/prices/${cryptoId}/history`
        );
        if (response.ok) {
          const data = await response.json();

          // Add cryptoId to each item in the response for filtering later
          const dataWithCryptoId = data.map((item) => ({
            ...item,
            cryptoId: cryptoId,
          }));
          this.cryptoData.push(...dataWithCryptoId);
        } else {
          console.error(`Failed to fetch data for crypto ID ${cryptoId}`);
        }
      }
    },
    async fetchCryptos() {
      const response = await fetch("http://localhost:8099/api/crypto-transactions/cryptos");
      this.cryptos = await response.json();
    },
    calculateQuartile1(data) {
      const prices = data.map((item) => item.currentPrice).sort((a, b) => a - b);
      const index = Math.floor(prices.length * 0.25);

      return prices[index];
    },
    calculateMaxMin(data) {
      const prices = data.map((item) => item.currentPrice);
      const max = Math.max(...prices);
      const min = Math.min(...prices);

      return { max, min };
    },
    calculateMoyenne(data) {
      const prices = data.map((item) => item.currentPrice);
      if (prices.length === 0) return 0;
      const sum = prices.reduce((acc, price) => acc + price, 0);
      return (sum / prices.length).toFixed(2); 
    },
    calculateEcartType(data) {
      const prices = data.map((item) => item.currentPrice);
      if (prices.length === 0) return 0;

      const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
      
      return Math.sqrt(variance).toFixed(2); 
    },
    runAnalysis() {
      this.analysisResults = []; 

      this.selectedCryptos.forEach((cryptoId) => {
        const cryptoLabel = this.cryptos.find((c) => c.id === cryptoId).label;
        const filteredData = this.cryptoData.filter((item) => {
          const isCryptoSelected = item.cryptoId === cryptoId;
          const isDateInRange =
            (!this.startDate || new Date(item.lastUpdate) >= new Date(this.startDate)) &&
            (!this.endDate || new Date(item.lastUpdate) <= new Date(this.endDate));
          return isCryptoSelected && isDateInRange;
        });

        if (filteredData.length > 0) {
          let resultValue;
          switch (this.selectedAnalysis) {
            case "quartile1":
              resultValue = this.calculateQuartile1(filteredData);
              break;
            case "maxMin":
              const { max, min } = this.calculateMaxMin(filteredData);
              resultValue = `Max: ${max}, Min: ${min}`;
              break;
            case "moyenne":
              resultValue = this.calculateMoyenne(filteredData);
              break;
            case "ecartType":
              resultValue = this.calculateEcartType(filteredData);
              break;
            default:
              resultValue = null;
          }
          
          if (resultValue !== null) {
            this.analysisResults.push({
              cryptoId,
              cryptoLabel,
              value: resultValue,
            });
          }
        }
      });
    },
    async fetchAndAnalyze() {
      if (this.selectedCryptos.length === 0) {
        alert("Please select at least one crypto.");
        return;
      }
      await this.fetchCryptoData(); 
      this.runAnalysis(); 
    },
    toggleSelectAll() {
      if (this.selectedCryptos.length === this.cryptos.length) {
        this.selectedCryptos = []; // Deselect all
      } else {
        this.selectedCryptos = this.cryptos.map(crypto => crypto.id); // Select all
      }
    }
  },
  mounted() {
    this.fetchCryptos(); 
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.card {
  border-radius: 10px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.table th,
.table td {
  text-align: center;
}
</style>