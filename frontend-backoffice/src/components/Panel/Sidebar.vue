<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white sidebar">
    <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <i class="fas fa-coins me-2"></i>
      <span class="fs-4">Back-Office</span>
    </router-link>
    <hr />

    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link to="/dashboard" class="nav-link" exact-active-class="active">
          <i class="fas fa-home"></i> Home
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/dashboard/transactions" class="nav-link" exact-active-class="active">
          <i class="fas fa-wallet"></i> Transactions
        </router-link>
      </li>
    </ul>

    <hr />
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none" data-bs-toggle="dropdown">
        <i class="fas fa-user me-2"></i> 
        <strong>Admin</strong>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
        <li><a class="dropdown-item" href="#">Déconnexion</a></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  transition: background-color 0.3s ease;
  display: flex; 
  align-items: center;  
  gap: 5px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.nav-link.active {
  background-color: #17a2b8;
}

/* Additional styles for dropdown items */
.dropdown-menu {
  left: auto; /* Align dropdown menu */
}
</style>