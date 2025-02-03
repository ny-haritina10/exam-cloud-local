<template>
    <div class="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white sidebar">
      <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <i class="fas fa-coins me-2"></i>
        <span class="fs-4">CryptoDash</span>
      </a>
      <hr />
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <a href="#" class="nav-link active">
            <i class="fas fa-chart-line me-2"></i> Dashboard
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-white">
            <i class="fas fa-wallet me-2"></i> Portefeuille
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-white">
            <i class="fas fa-exchange-alt me-2"></i> Transactions
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-white">
            <i class="fas fa-cogs me-2"></i> Paramètres
          </a>
        </li>
      </ul>
      <hr />
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
          <img src="https://via.placeholder.com/40" alt="" class="rounded-circle me-2" />
          <strong>Utilisateur</strong>
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
          <li><a class="dropdown-item" href="#">Profil</a></li>
          <li><a class="dropdown-item" href="#">Déconnexion</a></li>
        </ul>
      </div>
    </div>
  </template>
  
  <style scoped>
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
  </style>
  