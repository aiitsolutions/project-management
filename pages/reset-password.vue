<template>
  <div class="reset-page">
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
              <rect x="5" y="12" width="22" height="16" rx="2" fill="#4F46E5"/>
              <path d="M8 12V8C8 5.79086 9.79086 4 12 4H20C22.2091 4 24 5.79086 24 8V12" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 16V20M16 16V20" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Reset Your Password</h1>
          <p>Create a new password for your account.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="reset-form" v-if="!success">
          <div class="form-group">
            <label for="password">New Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="#9CA3AF" stroke-width="1.5"/>
                <path d="M6 8V5C6 3.34315 7.34315 2 9 2H11C12.6569 2 14 3.34315 14 5V8" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                required 
                placeholder="Enter new password"
                :disabled="loading"
              />
              <button type="button" class="toggle-password" @click="togglePassword('password')">
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="#9CA3AF" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2" stroke="#9CA3AF" stroke-width="1.5"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M8 8L12 12" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="#9CA3AF" stroke-width="1.5"/>
                </svg>
              </button>
            </div>
            <div class="password-strength" v-if="password">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.class"></div>
              </div>
              <span :class="passwordStrength.class">{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="#9CA3AF" stroke-width="1.5"/>
                <path d="M6 8V5C6 3.34315 7.34315 2 9 2H11C12.6569 2 14 3.34315 14 5V8" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input 
                id="confirmPassword" 
                v-model="confirmPassword" 
                type="password" 
                required 
                placeholder="Confirm new password"
                :disabled="loading"
              />
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" :disabled="loading || !isValidPassword" class="btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="success-message" v-else>
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#D1FAE5"/>
              <path d="M20 32L28 40L44 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Password Reset!</h2>
          <p>Your password has been successfully reset. You can now sign in with your new password.</p>
          <NuxtLink to="/login" class="btn-primary">
            Sign In
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="illustration">
        <div class="lock-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <rect x="25" y="40" width="50" height="45" rx="5" fill="white" fill-opacity="0.2"/>
            <rect x="25" y="40" width="50" height="45" rx="5" stroke="white" stroke-width="2"/>
            <path d="M35 40V30C35 22.268 40.268 17 48 17C55.732 17 61 22.268 61 30V40" stroke="white" stroke-width="3"/>
            <circle cx="48" cy="55" r="6" fill="white"/>
            <rect x="46" y="55" width="4" height="8" fill="white"/>
          </svg>
        </div>
        
        <div class="success-checkmarks">
          <div class="checkmark c1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981"/>
              <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="checkmark c2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#10B981"/>
              <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
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

const route = useRoute()
const { initAuth, isAuthenticated } = useAuth()

await initAuth()

if (isAuthenticated.value) {
  navigateTo('/dashboard')
}

const token = computed(() => route.query.token as string)

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const success = ref(false)
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

const isValidPassword = computed(() => {
  return password.value.length >= 6 && password.value === confirmPassword.value
})

const togglePassword = (field: string) => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!token.value) {
    error.value = 'Invalid reset token'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { 
        token: token.value,
        password: password.value
      }
    })
    success.value = true
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to reset password'
  }
  
  loading.value = false
}
</script>

<style scoped>
.reset-page {
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
  padding: 0.875rem 2.5rem 0.875rem 2.75rem;
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

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #4F46E5;
}

.password-strength {
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

.strength-fill.weak {
  width: 33%;
  background: #EF4444;
}

.strength-fill.medium {
  width: 66%;
  background: #F59E0B;
}

.strength-fill.strong {
  width: 100%;
  background: #10B981;
}

.password-strength span {
  font-size: 0.75rem;
  font-weight: 500;
}

.password-strength span.weak { color: #EF4444; }
.password-strength span.medium { color: #F59E0B; }
.password-strength span.strong { color: #10B981; }

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
  text-decoration: none;
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
  font-size: 1.5rem;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.success-message p {
  color: #6B7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
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

.lock-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.success-checkmarks {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.checkmark {
  position: absolute;
  animation: pop 2s ease-in-out infinite;
}

.c1 {
  top: 10%;
  right: 20%;
  animation-delay: 0s;
}

.c2 {
  bottom: 30%;
  left: 15%;
  animation-delay: 0.5s;
}

@keyframes pop {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
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