<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header bg-white shadow-sm p-3">
        <div class="header-container">
          <!-- Left Side: Welcome Back -->
          <h5 class="mb-0">Welcome to the Crypto App</h5>

          <!-- Right Side: User Info -->
          <div class="user-info">
            <template v-if="loading">
              <div class="spinner-border spinner-border-sm me-2"></div>
              <span>Loading...</span>
            </template>
            <template v-else-if="error">
              <span class="text-danger">{{ error }}</span>
            </template>
            <template v-else-if="currentUser">
              <span class="me-3">
                <i class="fas fa-user-circle me-2"></i>
                {{ currentUser.name }}
              </span>
              <span class="badge bg-primary me-3">{{ currentUser.role }}</span>
              <button 
                @click="handleLogout" 
                class="btn btn-outline-danger btn-sm"
                :disabled="isLoggingOut"
              >
                <template v-if="!isLoggingOut">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </template>
                <div v-else class="spinner-border spinner-border-sm"></div>
              </button>
            </template>
          </div>
        </div>
      </header>


      <!-- Page Content -->
      <div class="content p-4">
        <router-view></router-view>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-container">
          <small class="text-muted">© 2024 Your Company. All rights reserved.</small>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Panel/Sidebar.vue";
import AuthService from "@/services/auth";

export default {
  name: "Dashboard",
  components: {
    Sidebar
  },
  data() {
    return {
      currentUser: null,
      isLoggingOut: false,
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchUserDetails() {
      this.loading = true;
      this.error = null;
      try {
        this.currentUser = await AuthService.getCurrentUser();
        console.log('User', this.currentUser);
        
        // Check token expiration
        const expiresAt = new Date(this.currentUser.token_expires_at);
        if (expiresAt < new Date()) {
          await this.handleLogout();
          return;
        }

        // Set up expiration check
        this.setupExpirationCheck(expiresAt);
      } catch (error) {
        this.error = 'Failed to load user details';
        if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    setupExpirationCheck(expiresAt) {
      const timeUntilExpiration = expiresAt.getTime() - new Date().getTime();
      if (timeUntilExpiration > 0) {
        setTimeout(async () => {
          await this.handleLogout();
          this.$router.push('/login');
        }, timeUntilExpiration);
      }
    },
    async handleLogout() {
      if (this.isLoggingOut) return;
      
      this.isLoggingOut = true;
      try {
        await AuthService.logout();
        this.$router.push('/login');
      } catch (error) {
        alert('Logout failed. Please try again.');
      } finally {
        this.isLoggingOut = false;
      }
    }
  },
  created() {
    this.fetchUserDetails();
  }
};
</script>


<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh; /* Changed from min-height to height */
  overflow: hidden; /* Add this to prevent overall scrolling */
}

.main-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh; /* Changed from min-height to height */
  overflow-y: auto; /* This allows main content to scroll independently */
}

.content {
  flex-grow: 1;
  background-color: #f8f9fa;
}

.footer {
  background-color: white;
  padding: 15px;
  border-top: 1px solid #ddd;
  text-align: center;
}
/* Ensures the header layout is correct */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* The container inside the header should distribute items */
.header-container {
  display: flex;
  justify-content: space-between; /* Moves elements to opposite sides */
  align-items: center;
  width: 100%;
  max-width: 1100px;
}

/* User info alignment */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px; /* Adds spacing between elements */
}
</style>