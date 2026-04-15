<template>
  <div class="reset-form">
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
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      </div>
      <h1>Reset Your Password</h1>
      <p>Create a new password for your account.</p>
    </div>

    <form @submit.prevent="handleSubmit" v-if="!success">
      <div class="form-group">
        <label for="password">New Password</label>
        <div class="input-wrap">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 8V5C6 3.34 7.34 2 9 2H11C12.66 2 14 3.34 14 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input id="password" v-model="password" type="password" required placeholder="Enter new password" :disabled="loading" />
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
          <input id="confirmPassword" v-model="confirmPassword" type="password" required placeholder="Confirm new password" :disabled="loading" />
        </div>
        <p v-if="confirmPassword && password !== confirmPassword" class="match-error">Passwords don't match</p>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" :disabled="loading || !isValidPassword" class="submit-btn">
        <span v-if="loading" class="btn-spinner"></span>
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>
    </form>

    <div class="success-state" v-else>
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="rgba(16, 185, 129, 0.15)"/>
          <path d="M20 32L28 40L44 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Password Reset!</h2>
      <p>Your password has been successfully reset. You can now sign in with your new password.</p>
      <NuxtLink to="/login" class="submit-btn" style="display: inline-flex; text-decoration: none; margin-top: 1rem;">Sign In</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['switch-view'])

const route = useRoute()
const token = computed(() => route.query.token as string)

const password = ref('')
const confirmPassword = ref('')
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

const handleSubmit = async () => {
  error.value = ''
  if (!token.value) { error.value = 'Invalid reset token'; return }
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match'; return }
  if (password.value.length < 6) { error.value = 'Password must be at least 6 characters'; return }
  
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value }
    })
    success.value = true
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to reset password'
  }
  loading.value = false
}
</script>

<style scoped>
.reset-form {
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
  font-size: 1.5rem;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.success-state p {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}
</style>