<template>
  <div class="sidebar text-white" :class="{ 'collapsed': isSidebarCollapsed }">
    <div class="sidebar-header p-3 border-bottom">
      <h4 class="mb-0 d-flex align-items-center">
        <i class="fas fa-coins me-2"></i>
        <span v-if="!isSidebarCollapsed" class="ms-2">Front-Office</span>
      </h4>
    </div>
    <div class="sidebar-content p-3">
      <ul class="nav flex-column">
        <li class="nav-item mb-3" v-for="item in menuItems" :key="item.path">
          <router-link :to="item.path" class="nav-link text-white d-flex align-items-center">
            <i :class="item.icon"></i>
            <span v-if="!isSidebarCollapsed" class="ms-2">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="sidebar-footer">
      <div class="collapse-button" @click="toggleSidebar">
        <div class="icon-container">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  data() {
    return {
      isSidebarCollapsed: false,
      menuItems: [
        { path: "/dashboard", label: "Home", icon: "fas fa-home" },
        { path: "/dashboard/balance", label: "Wallet", icon: "fas fa-wallet" },
        { path: "/dashboard/commission", label: "Commission", icon: "fas fa-percentage" },
        { path: "/dashboard/crypto-prices", label: "Crypto Prices", icon: "fas fa-chart-bar" },
        { path: "/dashboard/transaction", label: "Cash Transaction", icon: "fas fa-exchange-alt" },
        { path: "/dashboard/user_transaction", label: "Transaction User", icon: "fas fa-user-alt" },
        { path: "/dashboard/crypto-transaction", label: "Crypto Transaction", icon: "fas fa-coins" },
        { path: "/dashboard/crypto_analysis", label: "Analyse Crypto Price", icon: "fas fa-chart-line" },
        { path: "/dashboard/transaction_commission", label: "Analyse Commission", icon: "fas fa-file-invoice-dollar" },
        { path: "/dashboard/crypto-transactions-list", label: "Crypto Transaction History", icon: "fas fa-history" },
      ],
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  position: sticky; /* Add this */
  top: 0; /* Add this */
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0; /* Add this to prevent sidebar from shrinking */
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-content {
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%; /* Ensure the link takes the full width */
  text-decoration: none; /* Optional: Remove underline if any */
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 1.2rem;
}

.nav-link span {
  white-space: nowrap;
  font-size: 1rem;
}

.nav-item {
  width: 100%; /* Ensure nav items take full width */
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-button {
  cursor: pointer;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.collapse-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon-container {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.icon-container i {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.collapse-button:hover .icon-container {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.sidebar {
  width: 300px;
  height: 100vh; /* Set the height to full viewport */
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  overflow-y: auto; /* Enable scrolling */
  overflow-x: hidden; /* Hide horizontal scrollbar */
}

.sidebar.collapsed {
  width: 100px;
}
</style>