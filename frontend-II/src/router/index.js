import { createRouter, createWebHistory } from 'vue-router';

// Importer les composants de pages
import LoginAdmin from '../components/Auth/LoginAdmin.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginAdmin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
