<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="form-wrapper">
        <div class="brand">
          <div class="brand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="brand-name">{{ settings?.name || 'ProjectHub' }}</span>
        </div>

        <div class="form-header">
          <h1>Create Account</h1>
          <p>Join your team and start managing projects</p>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="name">Full Name</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 18C3 14.134 6.134 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input id="name" v-model="name" type="text" required placeholder="Enter your full name" :disabled="loading" />
            </div>
          </div>

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

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 8V5C6 3.34 7.34 2 9 2H11C12.66 2 14 3.34 14 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input id="password" v-model="password" type="password" required placeholder="Create a password" :disabled="loading" />
            </div>
            <div class="strength-meter" v-if="password">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.class"></div>
              </div>
              <span class="strength-label" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 8V5C6 3.34 7.34 2 9 2H11C12.66 2 14 3.34 14 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input id="confirmPassword" v-model="confirmPassword" type="password" required placeholder="Confirm your password" :disabled="loading" />
            </div>
            <p v-if="confirmPassword && password !== confirmPassword" class="match-error">Passwords don't match</p>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" :disabled="loading || !isValid" class="submit-btn">
            <span v-if="loading" class="btn-spinner"></span>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

<p class="login-link">
          Already have an account? 
          <NuxtLink to="/login">Sign in</NuxtLink>
        </p>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-graphic">
        <div class="graphic-main">
          <div class="abstract-shape shape-1"></div>
          <div class="abstract-shape shape-2"></div>
          <div class="abstract-shape shape-3"></div>
          <div class="floating-card card-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>Task Complete</span>
          </div>
          <div class="floating-card card-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Sprint Planning</span>
          </div>
          <div class="floating-card card-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Team Collab</span>
          </div>
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

const { settings, fetchSettings } = useSettings()
const { register, isAuthenticated, initAuth } = useAuth()

onMounted(async () => {
  await fetchSettings()
  await initAuth()
  if (isAuthenticated.value) {
    navigateTo('/workspace/dashboard')
  }
})

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return { class: '', text: '' }
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 2) return { class: 'weak', text: 'Weak' }
  if (score <= 4) return { class: 'medium', text: 'Medium' }
  return { class: 'strong', text: 'Strong' }
})

const isValid = computed(() => {
  return name.value.trim() !== '' && 
         email.value.trim() !== '' && 
         password.value.length >= 6 && 
         password.value === confirmPassword.value
})

const handleRegister = async () => {
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  
  const result = await register(name.value, email.value, password.value)
  
  if (result.success) {
    navigateTo('/workspace/dashboard')
  } else {
    error.value = result.error || 'Registration failed'
  }
  
  loading.value = false
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.auth-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #ffffff;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color, #10B981) 0%, color-mix(in srgb, var(--primary-color, #10B981) 70%, #000) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6B7280;
  font-size: 0.9375rem;
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

.strength-meter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-fill.weak { width: 33%; background: #EF4444; }
.strength-fill.medium { width: 66%; background: #F59E0B; }
.strength-fill.strong { width: 100%; background: #10B981; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-label.weak { color: #EF4444; }
.strength-label.medium { color: #F59E0B; }
.strength-label.strong { color: #10B981; }

.match-error {
  color: #EF4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-msg {
  color: #EF4444;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #FEF2F2;
  border-radius: 6px;
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.login-link a {
  color: var(--primary-color, #10B981);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.auth-right {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color, #10B981) 0%, color-mix(in srgb, var(--primary-color, #10B981) 80%, #000) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-graphic {
  width: 100%;
  height: 100%;
  position: relative;
}

.graphic-main {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.abstract-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: white;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: white;
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: rgba(255,255,255,0.3);
  top: 40%;
  left: 20%;
  animation: float 6s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.floating-card {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  animation: card-float 4s ease-in-out infinite;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
}

.floating-card svg {
  color: var(--primary-color, #10B981);
  flex-shrink: 0;
}

.card-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.card-2 {
  bottom: 25%;
  right: 25%;
  animation-delay: 1s;
}

.card-3 {
  top: 45%;
  left: 10%;
  animation-delay: 2s;
}

@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 1024px) {
  .auth-right {
    display: none;
  }
  
  .auth-left {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .auth-left {
    padding: 1.5rem;
  }
}
</style>