<template>
  <div class="settings-workspace" :style="{ '--primary-color': primaryColor }">
    <header class="settings-header">
      <div class="header-titles">
        <h1>User Profile</h1>
        <p>Manage your account identity, security, and preferences.</p>
      </div>
      <div class="header-actions">
        <button class="btn-save-settings" :disabled="saving" @click="save">
          <svg v-if="saving" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>{{ saving ? 'Saving Changes...' : 'Save Profile' }}</span>
        </button>
      </div>
    </header>

    <main class="settings-grid">
      <!-- Left Column: Primary Identity -->
      <div class="settings-column">
        <section class="settings-card">
          <div class="card-header">
            <h3 class="card-title">Profile Details</h3>
            <p class="card-subtitle">Your personal information and avatar.</p>
          </div>
          <div class="card-body">
            <div class="logo-config-row" style="margin-top: 0; margin-bottom: 1.5rem;">
              <div class="logo-preview-box" style="border-radius: 50%;">
                <span class="preview-label" style="text-align: center; width: 100%;">Avatar</span>
                <div class="preview-content" style="border-radius: 50%; overflow: hidden;">
                  <img v-if="form.profile_photo" :src="form.profile_photo" alt="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                  <div v-else class="preview-placeholder" style="background:#E5E7EB; color:#6B7280; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
              </div>
              <div class="logo-inputs" style="display:flex; flex-direction:column; justify-content:center;">
                <label>Profile Picture</label>
                <div class="logo-upload-stub" style="margin-top:0.5rem; max-width: 200px;">
                   <div class="upload-trigger" @click="$refs.avatarInput.click()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>Upload Avatar</span>
                   </div>
                   <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                </div>
              </div>
            </div>

            <div class="grid-2">
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" v-model="form.name" placeholder="John Doe" class="base-input" />
              </div>
              <div class="input-group email-input-group">
                <label>Email Address</label>
                <div class="email-disabled-wrapper">
                  <input type="email" v-model="form.email" placeholder="john@example.com" class="base-input email-input" disabled />
                  <div class="email-tooltip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>Contact your Workspace Administrator to update your email address</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="settings-card mt-6">
          <div class="card-header">
            <h3 class="card-title">Change Password</h3>
            <p class="card-subtitle">Update your account password.</p>
          </div>
          <div class="card-body">
             <div class="input-group">
               <label>Current Password</label>
               <input type="password" v-model="passwordForm.oldPassword" placeholder="••••••••" class="base-input" />
             </div>
             <div class="input-group">
               <label>New Password</label>
               <input type="password" v-model="passwordForm.newPassword" placeholder="••••••••" class="base-input" />
             </div>
             <div class="input-group">
               <label>Confirm Password</label>
               <input type="password" v-model="passwordForm.confirmPassword" placeholder="••••••••" class="base-input" />
             </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Security -->
      <div class="settings-column">
        <section class="settings-card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 class="card-title">Two-Factor Authentication (2FA)</h3>
              <p class="card-subtitle">Enhance the security of your account.</p>
            </div>
            <div>
              <span v-if="user?.two_factor_enabled" class="status-badge completed">Enabled</span>
              <span v-else class="status-badge pending">Disabled</span>
            </div>
          </div>
          <div class="card-body">
            <div v-if="user?.two_factor_enabled" class="enabled-2fa-section">
              <div v-if="user.two_factor_method === 'email'" class="method-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Email-based 2FA</span>
              </div>
              <div v-else class="method-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Authenticator App</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 1rem 0;">Two-factor authentication is currently enabled on your account. You will be prompted for a verification code during login.</p>
              <button @click="showDisableModal" class="btn-sm" style="color: #EF4444; border-color: #EF4444;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                Disable 2FA
              </button>
            </div>
            <div v-else class="enable-options">
              <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1.5rem;">Add an additional layer of security to your account by enabling 2FA.</p>
              
              <div class="method-tabs">
                <button 
                  :class="['tab-btn', { active: selectedMethod === 'authenticator' }]"
                  @click="selectedMethod = 'authenticator'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Authenticator App
                </button>
                <button 
                  :class="['tab-btn', { active: selectedMethod === 'email' }]"
                  @click="selectedMethod = 'email'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Email Code
                </button>
              </div>

              <div v-if="selectedMethod === 'authenticator'" class="method-content">
                <div v-if="!setup2FA.qrCode" class="authenticator-setup-intro">
                  <div class="intro-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <p>Use an authenticator app like Google Authenticator or Authy to generate codes.</p>
                  <button @click="init2FA" class="btn-primary">
                    Setup Authenticator
                  </button>
                </div>
                <div v-else class="authenticator-setup-form">
                  <div class="setup-step">
                    <div class="step-header">
                      <span class="step-number">1</span>
                      <h4>Scan the QR Code</h4>
                    </div>
                    <div class="qr-code-box">
                      <img :src="setup2FA.qrCode" alt="QR Code" />
                    </div>
                    <p class="manual-code">Or enter code manually: <code>{{ setup2FA.secret }}</code></p>
                  </div>
                  
                  <div class="setup-step">
                    <div class="step-header">
                      <span class="step-number">2</span>
                      <h4>Verify Setup</h4>
                    </div>
                    <div class="code-input-wrapper">
                      <input 
                        type="text" 
                        v-model="setup2FA.code" 
                        placeholder="000000" 
                        class="base-input code-input-field" 
                        maxlength="6"
                      />
                    </div>
                  </div>
                  
                  <div class="verification-actions">
                    <button @click="verify2FA" class="btn-primary" :disabled="setup2FA.loading || setup2FA.code.length < 6">
                      {{ setup2FA.loading ? 'Verifying...' : 'Enable 2FA' }}
                    </button>
                    <button @click="cancelAuthenticatorSetup" class="btn-cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="method-content">
                <div v-if="!email2FA.pendingCode" class="email-setup-intro">
                  <div class="intro-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <p>We'll send a 6-digit verification code to your email address.</p>
                  <button @click="sendEmailCode" class="btn-primary">
                    Send Verification Code
                  </button>
                </div>
                <div v-else class="email-verification-form">
                  <div class="verification-header">
                    <div class="v-icon-circle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <h4>Verify Your Email</h4>
                      <p>Enter the 6-digit code sent to <strong>{{ user?.email }}</strong></p>
                    </div>
                  </div>
                  
                  <div class="code-input-wrapper">
                    <input 
                      type="text" 
                      v-model="email2FA.code" 
                      placeholder="000000" 
                      class="base-input code-input-field" 
                      maxlength="6" 
                    />
                  </div>
                  
                  <div class="resend-wrapper">
                    <span class="resend-label">Didn't receive the code?</span>
                    <button 
                      v-if="email2FA.resendCount < 3" 
                      type="button" 
                      @click="sendEmailCode" 
                      class="resend-btn"
                      :disabled="email2FA.loading"
                    >
                      {{ email2FA.loading ? 'Sending...' : 'Resend code' }}
                    </button>
                    <span v-else class="resend-limit">Maximum resends reached</span>
                  </div>
                  
                  <div class="verification-actions">
                    <button @click="verifyEmailCode" class="btn-primary" :disabled="email2FA.loading || email2FA.code.length < 6">
                      {{ email2FA.loading ? 'Verifying...' : 'Enable 2FA' }}
                    </button>
                    <button @click="email2FA.pendingCode = false; email2FA.code = ''" class="btn-cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Disable 2FA Modal -->
    <Transition name="fade">
      <div v-if="disableModal.show" class="modal-overlay" @click="disableModal.show = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Disable Two-Factor Authentication</h3>
            <button class="close-btn" @click="disableModal.show = false">×</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.</p>
            <template v-if="user?.two_factor_method === 'email'">
              <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Please enter your password to confirm.</p>
              <div class="input-group">
                <input type="password" v-model="disableModal.password" placeholder="Enter your password" class="base-input" />
              </div>
            </template>
            <template v-else>
              <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Please enter an authenticator code to confirm.</p>
              <div class="input-group">
                <input type="text" v-model="disableModal.code" placeholder="6-digit code" class="base-input" maxlength="6" style="text-align: center; letter-spacing: 0.25em; font-weight: 700;" />
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button @click="disableModal.show = false" class="btn-sm">Cancel</button>
            <button @click="confirmDisable2FA" class="btn-primary" style="background:#EF4444; color:white;" :disabled="disableModal.loading">
              {{ disableModal.loading ? 'Disabling...' : 'Confirm Disable' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { settings } = useSettings()
const { user, initAuth, fetchUser } = useAuth()
const saving = ref(false)
const primaryColor = ref(settings.value.colorScheme || '#10B981')

const fetchPrimaryColor = async () => {
  try {
    const data = await $fetch<any>('/api/settings')
    if (data?.colorScheme) primaryColor.value = data.colorScheme
  } catch (e) {
    console.error('Failed to fetch primary color', e)
  }
}

const form = reactive({
  name: '',
  email: '',
  profile_photo: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const setup2FA = reactive({
  qrCode: '',
  secret: '',
  code: '',
  loading: false
})

const selectedMethod = ref<'authenticator' | 'email'>('authenticator')

const email2FA = reactive({
  pendingCode: false,
  code: '',
  loading: false,
  resendCount: 0
})

const disableModal = reactive({
  show: false,
  code: '',
  password: '',
  loading: false
})

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

onMounted(async () => {
  await fetchPrimaryColor()
  await initAuth()
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    form.profile_photo = user.value.profile_photo || ''
  }
})

const save = async () => {
  if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('Passwords do not match', 'error')
    return
  }
  
  saving.value = true
  try {
    const updateData: any = {
      name: form.name,
      email: form.email,
      profile_photo: form.profile_photo
    }
    if (passwordForm.newPassword) {
      updateData.password = passwordForm.newPassword
      updateData.oldPassword = passwordForm.oldPassword
    }
    
    const token = useCookie('access_token').value
    await $fetch(`/api/users?id=${user.value?.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: updateData
    })
    
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    await fetchUser()
    showToast('Profile updated successfully')
  } catch (e: any) {
    console.error(e)
    showToast(e.data?.statusMessage || 'Failed to update profile', 'error')
  } finally {
    saving.value = false
  }
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    form.profile_photo = response.url
  } catch (e) {
    console.error('Upload failed')
  }
}

const init2FA = async () => {
  try {
    const token = useCookie('access_token').value
    const data = await $fetch('/api/2fa/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setup2FA.qrCode = data.qrDataUrl
    setup2FA.secret = data.secret
  } catch (e) {
    console.error(e)
    showToast('Failed to initialize 2FA', 'error')
  }
}

const verify2FA = async () => {
  setup2FA.loading = true
  try {
    const token = useCookie('access_token').value
    await $fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { code: setup2FA.code, secret: setup2FA.secret }
    })
    
    await initAuth()
    setup2FA.qrCode = ''
    setup2FA.secret = ''
    setup2FA.code = ''
    await fetchUser()
    showToast('2FA Enabled Successfully')
  } catch (e: any) {
    showToast(e.data?.statusMessage || 'Verification failed', 'error')
  } finally {
    setup2FA.loading = false
  }
}

const cancelAuthenticatorSetup = () => {
  setup2FA.qrCode = ''
  setup2FA.secret = ''
  setup2FA.code = ''
}

const sendEmailCode = async () => {
  if (email2FA.resendCount >= 3) return
  email2FA.loading = true
  try {
    const token = useCookie('access_token').value
    await $fetch('/api/2fa/email-setup-send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    email2FA.pendingCode = true
    email2FA.resendCount++
    showToast('Verification code sent to your email')
  } catch (e: any) {
    showToast(e.data?.statusMessage || 'Failed to send verification code', 'error')
  } finally {
    email2FA.loading = false
  }
}

const verifyEmailCode = async () => {
  email2FA.loading = true
  try {
    const token = useCookie('access_token').value
    await $fetch('/api/2fa/email-verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { code: email2FA.code }
    })
    
    await initAuth()
    email2FA.pendingCode = false
    email2FA.code = ''
    email2FA.resendCount = 0
    await fetchUser()
    showToast('Email 2FA Enabled Successfully')
  } catch (e: any) {
    showToast(e.data?.statusMessage || 'Verification failed', 'error')
  } finally {
    email2FA.loading = false
  }
}

const showDisableModal = () => {
  disableModal.code = ''
  disableModal.password = ''
  disableModal.show = true
}

const confirmDisable2FA = async () => {
  disableModal.loading = true
  try {
    const token = useCookie('access_token').value
    const body: any = {}
    
    if (user.value?.two_factor_method === 'email') {
      body.password = disableModal.password
    } else {
      body.code = disableModal.code
    }
    
    await $fetch('/api/2fa/email-enable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...body, enable: false }
    })
    
    await fetchUser()
    disableModal.show = false
    disableModal.code = ''
    disableModal.password = ''
    showToast('2FA Disabled')
  } catch (e: any) {
    showToast(e.data?.statusMessage || 'Failed to disable 2FA', 'error')
  } finally {
    disableModal.loading = false
  }
}
</script>

<style scoped>
/* Inherit from settings.vue layout styles with a twist if needed */
.settings-workspace {
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header-titles h1 {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.header-titles p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-save-settings {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-save-settings:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn-save-settings:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}

.settings-card {
  background: var(--color-bg-card);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  overflow: hidden;
}

.card-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid var(--color-border-light);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #94A3B8;
  margin: 0.25rem 0 0 0;
}

.card-body {
  padding: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.6rem;
}

.base-input, .base-select, .base-textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
}

.base-input:disabled, .base-select:disabled, .base-textarea:disabled {
  background-color: var(--color-border-light);
  cursor: not-allowed;
  color: var(--color-text-light);
  border-color: var(--color-border);
}

.email-disabled:disabled {
  cursor: help;
}

.email-input-group {
  position: relative;
}

.email-disabled-wrapper {
  position: relative;
}

.email-input:disabled {
  background-color: var(--color-border-light);
  cursor: not-allowed;
  color: var(--color-text-light);
  border-color: var(--color-border);
}

.email-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: #92400E;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.email-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 1.5rem;
  border: 6px solid transparent;
  border-top-color: #F59E0B;
}

.email-tooltip svg {
  flex-shrink: 0;
  color: #F59E0B;
}

.email-tooltip span {
  line-height: 1.4;
}

.email-disabled-wrapper:hover .email-tooltip {
  display: flex;
}

.base-input:focus, .base-select:focus, .base-textarea:focus {
  background: var(--color-bg-card);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.logo-config-row { display: flex; gap: 1.5rem; }
.logo-preview-box { width: 120px; background: var(--color-bg-main); border: 1px dashed var(--color-border); padding: 1rem; display: flex; flex-direction: column; align-items: center; }
.preview-label { font-size: 0.6rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.75rem; }
.preview-content { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.upload-trigger { display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.75rem 1rem; background: var(--color-bg-card); border: 2px dashed var(--color-border); border-radius: 12px; color: var(--color-text-muted); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.upload-trigger:hover { border-color: var(--primary-color); color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 5%, transparent); }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.hidden { display: none; }
.mt-6 { margin-top: 1.5rem; }
.btn-primary { background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
.btn-primary:hover { filter: brightness(1.1); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sm { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; }
.status-badge { padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px; }
.status-badge.completed { background: color-mix(in srgb, var(--primary-color) 12%, white); color: var(--primary-color); }
.status-badge.pending { background: var(--color-bg-subtle); color: var(--color-text-muted); }

.method-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.enable-options {
  margin-top: 1rem;
}

.method-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-btn.active {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.method-content {
  margin-top: 1rem;
}

.2fa-setup-area {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.2fa-setup-area h4 {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.2fa-setup-area h4:not(:first-child) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.2fa-setup-area p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.2fa-setup-area p strong {
  letter-spacing: 0.1em;
}

.qr-code-wrapper {
  background: var(--color-bg-card);
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 1rem;
}

.qr-code-wrapper img {
  width: 150px;
  height: 150px;
}

.code-input {
  max-width: 200px;
  text-align: center;
  letter-spacing: 0.25em;
  font-weight: 700;
}

.resend-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.resend-text.error {
  color: #EF4444;
}

.resend-text button {
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.toast-notification.success {
  background: var(--color-bg-card);
  color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
}

.toast-notification.error {
  background: var(--color-bg-card);
  color: #EF4444;
  border-left: 4px solid #EF4444;
}

/* Toast Transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-bg-card);
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 0 1.5rem 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--color-bg-main);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Email 2FA Styles */
.email-setup-intro, .authenticator-setup-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0;
}

.email-setup-intro .intro-icon, .authenticator-setup-intro .intro-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.email-setup-intro p, .authenticator-setup-intro p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.authenticator-setup-form, .email-verification-form {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
  border-radius: 16px;
  padding: 1.5rem;
}

.setup-step {
  margin-bottom: 1.5rem;
}

.setup-step:last-of-type {
  margin-bottom: 1rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-header h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.qr-code-box {
  background: var(--color-bg-card);
  padding: 1rem;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 0.75rem;
  border: 1px solid var(--color-border);
}

.qr-code-box img {
  width: 140px;
  height: 140px;
}

.manual-code {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.manual-code code {
  font-family: monospace;
  background: var(--color-bg-main);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: var(--color-text-primary);
}

.email-verification-form {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
  border-radius: 16px;
  padding: 1.5rem;
}

.verification-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.v-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-bg-card);
  border: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.verification-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
}

.verification-header p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.verification-header p strong {
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.code-input-wrapper {
  margin-bottom: 1rem;
}

.code-input-field {
  width: 100%;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.35em;
  padding: 1rem;
  border-radius: 12px;
}

.resend-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
}

.resend-label {
  color: var(--color-text-muted);
}

.resend-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
}

.resend-btn:hover {
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-limit {
  color: #EF4444;
  font-size: 0.75rem;
}

.verification-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-secondary);
}
</style>
