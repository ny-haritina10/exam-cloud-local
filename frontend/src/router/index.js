import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Auth/Login.vue';
import LoginAdmin from '../components/Auth/LoginAdmin.vue';
import AuthFlow from '../components/Auth/AuthFlow.vue';
import Dashboard from '../components/Panel/Dashboard.vue';
import CryptoPrices from '../components/Crypto/CryptoPrices.vue';
import TransactionForm from '../components/Transaction/TransactionForm.vue';
import CryptoTransaction from '../components/Crypto/CryptoTransaction.vue';
import CryptoTransactionsList from '../components/Crypto/CryptoTransactionsList.vue';
import UserBalance from '../components/User/UserBalance.vue';
import UserTransaction from '../components/User/UserTransaction.vue';
import CryptoAnalysis from '../components/Crypto/CryptoAnalysis.vue';
import CommissionList from '../components/Commission/CommissionList.vue';
import TransactionCommissionList from '../components/Commission/TransactionCommissionList.vue';

const routes = [
  { path: '/', component: AuthFlow },
  { path: '/login', component: Login },
  { path: '/login_admin', component: LoginAdmin },
  { path: '/signup', component: AuthFlow },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }, // routes that need authentication
    children: [
      { path: 'crypto-prices', component: CryptoPrices },
      { path: 'transaction', component: TransactionForm },
      { path: 'crypto-transaction', component: CryptoTransaction },
      { path: 'crypto-transactions-list', component: CryptoTransactionsList },
      { path: 'balance', component: UserBalance },
      { path: 'user_transaction', component: UserTransaction },
      { path: 'crypto_analysis', component: CryptoAnalysis },
      { path: 'commission', component: CommissionList },
      { path: 'transaction_commission', component: TransactionCommissionList },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login');
    } 
    
    else {
      next(); 
    }
  } 
  
  else 
  { next(); }
});

export default router;