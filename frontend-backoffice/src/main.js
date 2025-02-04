import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importation du router

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App);
app.use(router); // Utilisation du router
app.mount('#app');
