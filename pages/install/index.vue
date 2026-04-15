<template>
  <div class="install-page">
    <div class="install-container">
      <div class="install-header">
        <div class="logo-icon">
          <svg class="logo-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <h1 class="app-title">Project Management</h1>
        <p class="app-subtitle">Installation Wizard</p>
      </div>
      
      <div class="install-card">
        <div class="steps-indicator">
          <div v-for="(stepItem, index) in steps" :key="index" class="step-wrapper">
            <div 
              class="step-circle"
              :class="{ 'active': currentStep >= index + 1, 'completed': currentStep > index + 1 }"
            >
              <svg v-if="currentStep > index + 1" class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div v-if="index < steps.length - 1" class="step-line" :class="{ 'active': currentStep > index + 1 }"></div>
          </div>
        </div>
        <div class="step-title">{{ steps[currentStep - 1]?.title }}</div>

        <div class="step-content">
          <div v-if="currentStep === 1" class="step-panel">
            <div class="panel-header">
              <h2 class="panel-title">Welcome!</h2>
              <p class="panel-desc">This wizard will help you set up your project management system.</p>
            </div>
            
            <div class="requirements-list">
              <div class="req-item">
                <div class="req-icon success">
                  <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="req-label">Node.js Environment</span>
                <span class="req-status success">OK</span>
              </div>
              
              <div class="req-item">
                <div class="req-icon success">
                  <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="req-label">Write Permissions</span>
                <span class="req-status success">OK</span>
              </div>
            </div>
            
            <div class="info-box">
              <p class="info-text">
                <strong>Note:</strong> This application uses a file-based database. No database server is required.
              </p>
            </div>
          </div>

          <div v-if="currentStep === 2" class="step-panel">
            <div class="panel-header">
              <h2 class="panel-title">Admin Account</h2>
              <p class="panel-desc">Create the administrator account for your system.</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input 
                v-model="formData.adminName"
                type="text" 
                class="form-input"
                placeholder="John Doe"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input 
                v-model="formData.adminEmail"
                type="email" 
                class="form-input"
                placeholder="admin@example.com"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input 
                v-model="formData.adminPassword"
                type="password" 
                class="form-input"
                placeholder="Enter password"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input 
                v-model="formData.adminPasswordConfirm"
                type="password" 
                class="form-input"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div v-if="currentStep === 3" class="step-panel">
            <div class="panel-header">
              <h2 class="panel-title">Workspace Setup</h2>
              <p class="panel-desc">Configure your organization's workspace.</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Workspace Name</label>
              <input 
                v-model="formData.workspaceName"
                type="text" 
                class="form-input"
                placeholder="My Company"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Color Scheme</label>
              <div class="color-picker">
                <button 
                  v-for="color in colorOptions" 
                  :key="color"
                  type="button"
                  class="color-btn"
                  :class="{ 'selected': formData.colorScheme === color }"
                  :style="{ backgroundColor: color }"
                  @click="formData.colorScheme = color"
                ></button>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 4" class="step-panel">
            <div class="panel-header centered">
              <div class="success-icon">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 class="panel-title">Ready to Install</h2>
              <p class="panel-desc">Review your configuration and complete the installation.</p>
            </div>
            
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Admin Email:</span>
                <span class="summary-value">{{ formData.adminEmail }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Workspace Name:</span>
                <span class="summary-value">{{ formData.workspaceName }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Color Scheme:</span>
                <div class="summary-color">
                  <div class="color-dot" :style="{ backgroundColor: formData.colorScheme }"></div>
                  <span class="summary-value">{{ formData.colorScheme }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="errorMessage" class="error-box">
              <p class="error-text">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button 
            v-if="currentStep > 1"
            @click="currentStep--"
            class="btn btn-secondary"
          >
            Back
          </button>
          <div v-else class="btn-spacer"></div>
          
          <button 
            v-if="currentStep < 4"
            @click="nextStep"
            :disabled="!canProceed"
            class="btn btn-primary"
          >
            Continue
          </button>
          <button 
            v-else
            @click="install"
            :disabled="installing"
            class="btn btn-primary"
          >
            <span v-if="installing" class="btn-loading">
              <svg class="spin-icon" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Installing...
            </span>
            <span v-else>Complete Installation</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'install'
})

const steps = [
  { title: 'Welcome' },
  { title: 'Admin Account' },
  { title: 'Workspace' },
  { title: 'Complete' }
]

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', 
  '#F59E0B', '#EF4444', '#06B6D4', '#84CC16',
  '#6366F1', '#14B8A6', '#F97316', '#E11D48'
]

const currentStep = ref(1)
const installing = ref(false)
const errorMessage = ref('')

const formData = reactive({
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
  workspaceName: '',
  colorScheme: '#10B981'
})

const canProceed = computed(() => {
  if (currentStep.value === 2) {
    return formData.adminName.trim() !== '' && 
           formData.adminEmail.trim() !== '' && 
           formData.adminPassword !== '' &&
           formData.adminPassword === formData.adminPasswordConfirm &&
           formData.adminPassword.length >= 6
  }
  if (currentStep.value === 3) {
    return formData.workspaceName.trim() !== ''
  }
  return true
})

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    errorMessage.value = ''
  }
}

const install = async () => {
  if (formData.adminPassword !== formData.adminPasswordConfirm) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  if (formData.adminPassword.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }
  
  installing.value = true
  errorMessage.value = ''
  
  try {
    await $fetch('/api/install', {
      method: 'POST',
      body: {
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        workspaceName: formData.workspaceName,
        colorScheme: formData.colorScheme
      }
    })
    
    navigateTo('/login')
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Installation failed. Please try again.'
    installing.value = false
  }
}
</script>

<style>
.install-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.install-container {
  width: 100%;
  max-width: 540px;
}

.install-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
}

.logo-svg {
  width: 2rem;
  height: 2rem;
  color: white;
}

.app-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

.install-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.steps-indicator {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-wrapper {
  display: flex;
  align-items: center;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  background: #334155;
  color: #94a3b8;
}

.step-circle.active {
  background: #10b981;
  color: white;
  box-shadow: 0 10px 15px rgba(16, 185, 129, 0.3);
}

.step-circle.completed {
  background: #10b981;
  color: white;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.step-line {
  width: 4rem;
  height: 2px;
  background: #334155;
  transition: all 0.3s;
  margin: 0 0.5rem;
}

.step-line.active {
  background: #10b981;
}

.step-title {
  text-align: center;
  padding: 1rem;
  color: #e2e8f0;
  font-weight: 500;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.step-content {
  padding: 2rem;
}

.step-panel {
  display: none;
}

.step-panel:first-child {
  display: block;
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-header.centered {
  text-align: center;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.panel-desc {
  color: #94a3b8;
  font-size: 0.875rem;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.req-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 0.75rem;
}

.req-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  background: rgba(16, 185, 129, 0.2);
}

.req-icon.success .icon-svg {
  color: #34d399;
  width: 1.25rem;
  height: 1.25rem;
}

.req-label {
  flex: 1;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.req-status {
  color: #34d399;
  font-weight: 500;
  font-size: 0.875rem;
}

.info-box {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
}

.info-text {
  font-size: 0.875rem;
  color: #60a5fa;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid #475569;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.color-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.selected {
  border-color: white;
  box-shadow: 0 0 0 2px #0f172a;
}

.success-icon {
  width: 5rem;
  height: 5rem;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.success-icon .icon-svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #34d399;
}

.summary-box {
  padding: 1.5rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.summary-value {
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

.summary-color {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.error-box {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
}

.error-text {
  font-size: 0.875rem;
  color: #f87171;
}

.step-actions {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #334155;
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spacer {
  width: 1px;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spin-icon {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .step-line {
    width: 2rem;
  }
  
  .color-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>