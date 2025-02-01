<template>
  <div class="container mt-5">
    <h1 class="mb-4">Crypto Price Analysis</h1>

    <!-- Filter Form -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Filters</h5>
        <div class="row">
          <!-- Analysis Type Dropdown -->
          <div class="col-md-4 mb-3">
            <label for="analysisType" class="form-label">Analysis Type</label>
            <select id="analysisType" class="form-select" v-model="selectedAnalysis">
              <option value="quartile1">1er Quartile</option>
              <option value="maxMin">Max and Min</option>
              <option value="moyenne">Moyenne</option>
              <option value="ecartType">Écart-Type</option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div class="col-md-4 mb-3">
            <label for="startDate" class="form-label">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              class="form-control"
              v-model="startDate"
            />
          </div>
          <div class="col-md-4 mb-3">
            <label for="endDate" class="form-label">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              class="form-control"
              v-model="endDate"
            />
          </div>
        </div>

        <!-- Crypto Filter Checkboxes -->
        <div class="row">
          <div class="col-md-12">
            <label class="form-label">Filter by Cryptos</label>
            <div class="row">
              <div
                v-for="crypto in cryptos"
                :key="crypto.id"
                class="col-md-3 mb-2"
              >
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="'crypto' + crypto.id"
                    :value="crypto.id"
                    v-model="selectedCryptos"
                  />
                  <label class="form-check-label" :for="'crypto' + crypto.id">
                    {{ crypto.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analyse and Select All Buttons -->
        <div class="text-center mt-4">
          <button class="btn btn-primary" @click="fetchAndAnalyze">
            Analyse
          </button>
          <button class="btn btn-secondary ms-2" @click="toggleSelectAll">
            {{ selectAllButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Display Results -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Analysis Results</h5>
        <div v-if="analysisResults.length > 0">
          <div
            v-for="result in analysisResults"
            :key="result.cryptoId"
            class="mb-3"
          >
            <strong>{{ result.cryptoLabel }}</strong>: {{ result.value }}
          </div>
        </div>
        <p v-else class="text-muted">No results to display. Select cryptos and click "Analyse".</p>
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
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
.form-label {
  font-weight: 500;
}
</style>