<template>
  <div class="forgot-page">
    <div class="left-panel">
      <div class="form-container">
        <NuxtLink to="/login" class="back-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Login
        </NuxtLink>

        <div class="form-header">
          <div class="icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="5" y="12" width="22" height="16" rx="2" stroke="#4F46E5" stroke-width="2"/>
              <path d="M8 12V8C8 5.79086 9.79086 4 12 4H20C22.2091 4 24 5.79086 24 8V12" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>
              <circle cx="16" cy="20" r="2" fill="#4F46E5"/>
            </svg>
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="forgot-form" v-if="!emailSent">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" stroke="#9CA3AF" stroke-width="1.5"/>
                <path d="M3 7L8.5 11L17 7" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                placeholder="Enter your email"
                :disabled="loading"
              />
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="success-message" v-else>
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#D1FAE5"/>
              <path d="M16 24L22 30L32 18" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Check Your Email</h2>
          <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
          <button @click="emailSent = false" class="btn-secondary">Didn't receive? Resend</button>
        </div>

        <p class="switch-link">
          Remember your password? 
          <NuxtLink to="/login">Sign In</NuxtLink>
        </p>
      </div>
    </div>

    <div class="right-panel">
      <div class="illustration">
        <div class="email-icon">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            <rect x="10" y="20" width="100" height="70" rx="8" fill="white" fill-opacity="0.2"/>
            <rect x="10" y="20" width="100" height="70" rx="8" stroke="white" stroke-width="2"/>
            <path d="M10 35L60 60L110 35" stroke="white" stroke-width="2"/>
            <path d="M25 45L45 58" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="85" cy="60" r="8" fill="white"/>
            <path d="M82 60L85 63L89 57" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <div class="floating-particles">
          <div class="particle p1"></div>
          <div class="particle p2"></div>
          <div class="particle p3"></div>
          <div class="particle p4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public',
  middleware: 'guest'
})

const { initAuth, isAuthenticated } = useAuth()

await initAuth()

if (isAuthenticated.value) {
  navigateTo('/dashboard')
}

const email = ref('')
const emailSent = ref(false)
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    emailSent.value = true
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to send reset link'
  }
  
  loading.value = false
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
}

.left-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #ffffff;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #4F46E5;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.icon-wrapper {
  display: inline-flex;
  padding: 1rem;
  background: #EEF2FF;
  border-radius: 16px;
  margin-bottom: 1rem;
}

.form-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: #6B7280;
  margin: 0;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #F9FAFB;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #4F46E5;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338CA;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #EF4444;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #FEF2F2;
  border-radius: 6px;
}

.success-message {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-message h2 {
  font-size: 1.25rem;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.success-message p {
  color: #6B7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: #4F46E5;
  border: 1px solid #4F46E5;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #EEF2FF;
}

.switch-link {
  text-align: center;
  margin-top: 2rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.switch-link a {
  color: #4F46E5;
  text-decoration: none;
  font-weight: 600;
}

.switch-link a:hover {
  text-decoration: underline;
}

.right-panel {
  flex: 1;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.illustration {
  position: relative;
}

.email-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: particle-float 4s ease-in-out infinite;
}

.p1 {
  width: 10px;
  height: 10px;
  background: rgba(255,255,255,0.5);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.p2 {
  width: 15px;
  height: 15px;
  background: rgba(255,255,255,0.3);
  top: 40%;
  right: 15%;
  animation-delay: 1s;
}

.p3 {
  width: 8px;
  height: 8px;
  background: rgba(255,255,255,0.6);
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.p4 {
  width: 12px;
  height: 12px;
  background: rgba(255,255,255,0.4);
  bottom: 20%;
  right: 10%;
  animation-delay: 1.5s;
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

@media (max-width: 1024px) {
  .right-panel {
    display: none;
  }
  
  .left-panel {
    flex: none;
    width: 100%;
  }
}
</style>