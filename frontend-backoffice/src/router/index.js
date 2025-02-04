import { createRouter, createWebHistory } from 'vue-router';

import LoginAdmin from '../components/Auth/LoginAdmin.vue';
import Dashboard from '../components/Panel/Dashboard.vue';
import Transactions from '../components/Transaction/Transactions.vue';

const routes = [
  { path: '/', name: 'login', component: LoginAdmin },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    children: [
      {
        path: '', 
        component: () => import('../components/Panel/Dashboard.vue'), 
      },
      {
        path: 'transactions', 
        component: Transactions,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;