<template>
  <div class="login-form">
    <div class="form-header">
      <h1>Welcome Back</h1>
      <p>Sign in to continue to your workspace</p>
    </div>

    <form @submit.prevent="handleLogin">
      <template v-if="!requires2FA">
        <div class="form-group">
          <label for="email">Email</label>
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
            <input id="password" v-model="password" type="password" required placeholder="Enter your password" :disabled="loading" />
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            <span class="checkbox-text">Remember me</span>
          </label>
          <button type="button" class="link-btn" @click="$emit('switch-view', 'forgot')">Forgot Password?</button>
        </div>
      </template>

      <template v-else>
        <div class="two-factor-section">
          <div class="factor-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>Two-Factor Authentication</h3>
          <p class="factor-desc">
            {{ twoFactorMethod === 'email' ? 'Enter the verification code sent to your email' : 'Enter the 6-digit code from your authenticator app' }}
          </p>
          
          <div class="form-group">
            <div class="input-wrap">
              <input 
                id="twoFactorCode" 
                v-model="twoFactorCode" 
                type="text" 
                maxlength="6" 
                required 
                placeholder="000000" 
                :disabled="loading" 
                class="code-input"
              />
            </div>
          </div>
          
          <div v-if="twoFactorMethod === 'email'" class="resend-section">
            <p v-if="resendCount < 3" class="resend-text">
              Didn't receive the code? 
              <button type="button" @click="resendCode" :disabled="resendLoading" class="resend-btn">
                {{ resendLoading ? 'Sending...' : 'Resend code' }}
              </button>
            </p>
            <p v-else class="resend-text error">Maximum attempts reached. Try again later.</p>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberDevice" />
              <span class="checkmark"></span>
              <span class="checkbox-text">Trust this device for 30 days</span>
            </label>
          </div>
          
          <button type="button" class="back-btn" @click="requires2FA = false">Back to login</button>
        </div>
      </template>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" :disabled="loading" class="submit-btn">
        <span v-if="loading" class="btn-spinner"></span>
        {{ loading ? (requires2FA ? 'Verifying...' : 'Signing in...') : (requires2FA ? 'Verify' : 'Sign In') }}
      </button>
    </form>

    <p v-if="settings?.publicRegistration !== false" class="signup-link">
      Don't have an account? 
      <NuxtLink to="/register">Create one</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['switch-view'])

const { settings } = useSettings()
const { login, isAuthenticated, initAuth } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const rememberDevice = ref(false)
const requires2FA = ref(false)
const twoFactorCode = ref('')
const twoFactorMethod = ref<'authenticator' | 'email'>('authenticator')
const error = ref('')
const loading = ref(false)
const resendCount = ref(0)
const resendLoading = ref(false)

onMounted(async () => {
  await initAuth()
  if (isAuthenticated.value) {
    navigateTo('/workspace/dashboard')
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  const result = await login(email.value, password.value, requires2FA.value ? twoFactorCode.value : undefined, rememberDevice.value)
  if (result.success && result.requires2FA) {
    requires2FA.value = true
    twoFactorMethod.value = result.method || 'authenticator'
  } else if (result.success) {
    navigateTo('/workspace/dashboard')
  } else {
    error.value = result.error || 'Login failed'
  }
  loading.value = false
}

const resendCode = async () => {
  resendLoading.value = true
  try {
    await $fetch('/api/2fa/email-send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${useCookie('access_token').value}` }
    })
    resendCount.value++
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Failed to resend code'
  } finally {
    resendLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: var(--primary-color, #10B981);
  border-color: var(--primary-color, #10B981);
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  user-select: none;
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary-color, #10B981);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.link-btn:hover {
  color: var(--primary-color-dark, #059669);
  text-decoration: underline;
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

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.signup-link a {
  color: var(--primary-color, #10B981);
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* 2FA Section */
.two-factor-section {
  text-align: center;
  padding: 1.5rem 0;
}

.factor-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-color-alpha, rgba(16, 185, 129, 0.1));
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.factor-icon svg {
  color: var(--primary-color, #10B981);
}

.two-factor-section h3 {
  font-size: 1.25rem;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.factor-desc {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.code-input {
  text-align: center !important;
  font-size: 1.5rem !important;
  font-weight: 700;
  letter-spacing: 0.25em;
  padding-left: 1rem !important;
}

.resend-section {
  margin-bottom: 1rem;
}

.resend-text {
  font-size: 0.875rem;
  color: #6B7280;
}

.resend-text.error {
  color: #EF4444;
}

.resend-btn {
  background: none;
  border: none;
  color: var(--primary-color, #10B981);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.6;
}

.back-btn {
  background: none;
  border: none;
  color: #6B7280;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 1rem;
}

.back-btn:hover {
  color: #374151;
}
</style>