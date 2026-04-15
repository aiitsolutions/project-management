<template>
  <div class="forgot-form">
    <button class="back-btn" @click="$emit('switch-view', 'login')">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back to Login
    </button>

    <div class="form-header">
      <div class="header-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1>Forgot Password?</h1>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
    </div>

    <form @submit.prevent="handleSubmit" v-if="!emailSent">
      <div class="form-group">
        <label for="email">Email Address</label>
        <div class="input-wrap">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 7L8.5 11L17 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input id="email" v-model="email" type="email" required placeholder="Enter your email" :disabled="loading" />
        </div>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" :disabled="loading" class="submit-btn">
        <span v-if="loading" class="btn-spinner"></span>
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>

    <div class="success-state" v-else>
      <div class="success-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="rgba(16, 185, 129, 0.15)"/>
          <path d="M16 24L22 30L32 18" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Check Your Email</h2>
      <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
      <button @click="emailSent = false" class="resend-link">Didn't receive? Resend</button>
    </div>

    <p class="login-link">
      Remember your password? 
      <button @click="$emit('switch-view', 'login')">Sign In</button>
    </p>
  </div>
</template>

<script setup lang="ts">
defineEmits(['switch-view'])

const { initAuth, isAuthenticated } = useAuth()

const email = ref('')
const emailSent = ref(false)
const error = ref('')
const loading = ref(false)

onMounted(async () => {
  await initAuth()
  if (isAuthenticated.value) {
    navigateTo('/workspace/dashboard')
  }
})

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
.forgot-form {
  width: 100%;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  background: none;
  border: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--primary-color, #10B981);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  display: inline-flex;
  padding: 1rem;
  background: var(--primary-color-alpha, rgba(16, 185, 129, 0.1));
  border-radius: 16px;
  margin-bottom: 1rem;
}

.header-icon svg {
  color: var(--primary-color, #10B981);
}

.form-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6B7280;
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

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.input-wrap input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: #F9FAFB;
}

.input-wrap input:focus {
  outline: none;
  border-color: var(--primary-color, #10B981);
  background: #fff;
  box-shadow: 0 0 0 3px var(--primary-color-alpha, rgba(16, 185, 129, 0.1));
}

.input-wrap input:disabled {
  opacity: 0.6;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--primary-color, #10B981) 0%, var(--primary-color-dark, #059669) 100%);
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

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 10px 25px var(--primary-color-alpha, rgba(16, 185, 129, 0.3));
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  color: #EF4444;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #FEF2F2;
  border-radius: 6px;
}

.success-state {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-state h2 {
  font-size: 1.25rem;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.success-state p {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.success-state strong {
  color: #1F2937;
}

.resend-link {
  background: none;
  border: none;
  color: var(--primary-color, #10B981);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 2rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.login-link button {
  background: none;
  border: none;
  color: var(--primary-color, #10B981);
  font-weight: 600;
  cursor: pointer;
}

.login-link button:hover {
  text-decoration: underline;
}
</style>