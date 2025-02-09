<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <Sidebar class="sidebar-container" />

    <!-- Main Content -->
    <div class="content-container">
      <!-- Header -->
      <header class="navbar navbar-dark bg-dark px-4">
        <span class="navbar-brand mb-0 h4">Welcome to the Crypto App</span>
        <button class="btn btn-outline-light" @click="logout">
          <i class="fas fa-sign-out-alt me-2"></i> Logout
        </button>
      </header>

      <!-- Main Content -->
      <main class="p-4">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Panel/Sidebar.vue";

export default {
  components: { Sidebar },
  methods: {
    logout() {
      localStorage.removeItem("id_admin"); 
      localStorage.removeItem("token");
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
/* Sidebar */
.sidebar-container {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

/* Content */
.content-container {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
}

/* Header */
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>