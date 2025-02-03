<template>
    <div class="container">
      <div class="row justify-content-center min-vh-100 align-items-center">
        <div class="col-md-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-user-shield fa-3x text-primary mb-3"></i>
                <h2 class="fw-bold">Admin Login</h2>
                <p class="text-muted">Admin access only</p>
              </div>
  
              <div v-if="message" :class="`alert alert-${status} alert-dismissible fade show`" role="alert">
                <i :class="`fas fa-${status === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`"></i>
                {{ message }}
                <button type="button" class="btn-close" @click="clearMessage"></button>
              </div>
  
              <form @submit.prevent="handleSubmit">
                <div class="form-floating mb-3">
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="formData.email"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="name@example.com"
                    required
                  >
                  <label for="email">
                    <i class="fas fa-envelope text-muted me-2"></i>Admin Email
                  </label>
                  <div class="invalid-feedback" v-if="errors.email">
                    {{ errors.email[0] }}
                  </div>
                </div>
  
                <div class="form-floating mb-4">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="password" 
                    v-model="formData.password"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="Password"
                    required
                  >
                  <label for="password">
                    <i class="fas fa-lock text-muted me-2"></i>Admin Password
                  </label>
                  <span 
                    class="position-absolute end-0 top-50 translate-middle-y me-3" 
                    style="cursor: pointer;"
                    @click="togglePassword"
                  >
                    <i :class="`fas fa-eye${showPassword ? '-slash' : ''} text-muted`"></i>
                  </span>
                  <div class="invalid-feedback" v-if="errors.password">
                    {{ errors.password[0] }}
                  </div>
                </div>
  
                <button 
                  class="btn btn-primary w-100 py-3 mb-3" 
                  type="submit"
                  :disabled="loading"
                >
                  <span v-if="!loading">
                    <i class="fas fa-sign-in-alt me-2"></i>Admin Login
                  </span>
                  <div v-else class="spinner-border spinner-border-sm"></div>
                </button>
              </form>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script>
  import axios from 'axios';
  
  export default {
    name: 'LoginAdmin',
    data() {
      return {
        formData: {
          email: '',
          password: ''
        },
        loading: false,
        message: '',
        status: '',
        errors: {},
        showPassword: false
      };
    },
    methods: {
      clearMessage() {
        this.message = '';
        this.status = '';
      },
      togglePassword() {
        this.showPassword = !this.showPassword;
      },
      async handleSubmit() {
        this.loading = true;
        this.clearMessage();
        this.errors = {};
  
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/auth/admin/login', this.formData, {
            headers: { 'Content-Type': 'application/json' }
          });
  
          if (response.data.status === 'success') {
            // Sauvegarde du token et de l'expiration dans le localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('tokenExpiration', response.data.expires_at);
  
            // Redirection vers le dashboard
            this.$router.push({ name: 'dashboard' });
          }
        } catch (error) {
          this.status = 'danger';
  
          if (error.response?.data?.errors) {
            this.errors = error.response.data.errors;
            this.message = 'Please correct the errors below.';
          } else {
            this.message = error.response?.data?.message || 'Admin login failed';
          }
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  
  <style scoped>
  .card {
    border-radius: 1rem;
    transition: all 0.3s ease;
  }
  
  .form-control {
    border-radius: 0.5rem;
  }
  
  .form-control:focus {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
  }
  
  .btn-primary {
    border-radius: 0.5rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
  }
  
  .alert {
    border-radius: 0.5rem;
  }
  </style>