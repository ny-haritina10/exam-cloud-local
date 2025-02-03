import { createRouter, createWebHistory } from 'vue-router';

import LoginAdmin from '../components/Auth/LoginAdmin.vue';
import Dashboard from '../components/Panel/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginAdmin
  },
  { 
    path: '/dashboard',
    name: 'dashboard',  // Assurez-vous d'ajouter un nom à cette route
    component: Dashboard 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
