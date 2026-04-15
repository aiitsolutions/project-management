<template>
  <div class="settings-workspace">
    <header class="settings-header">
      <div class="header-titles">
        <h1>General Settings</h1>
        <p>Manage application branding, identity, and global preferences.</p>
      </div>
      <div class="header-actions">
        <button class="btn-save-settings" :disabled="saving" @click="save">
          <svg v-if="saving" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>{{ saving ? 'Saving Changes...' : 'Save Configuration' }}</span>
        </button>
      </div>
    </header>

    <main class="settings-grid">
      <!-- Left Column: Primary Identity -->
      <div class="settings-column">
        <section class="settings-card">
          <div class="card-header">
            <h3 class="card-title">General Branding</h3>
            <p class="card-subtitle">Define how your application appears to users.</p>
          </div>
          <div class="card-body">
            <div class="input-group">
              <label>Application Name</label>
              <input type="text" v-model="form.name" placeholder="e.g. Antigravity" class="base-input" />
            </div>

            <div class="logo-config-row">
              <div class="logo-preview-box">
                <span class="preview-label">Live Preview</span>
                <div class="preview-content">
                  <div v-if="form.logo" class="preview-img">
                    <img :src="form.logo" alt="logo" />
                  </div>
                  <div v-else class="preview-placeholder" :style="{ backgroundColor: form.colorScheme + '20', color: form.colorScheme }">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                </div>
                <button v-if="form.logo" class="preview-remove-btn" @click="form.logo = ''" title="Remove logo">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="logo-inputs">
                <label>Application Logo</label>
                <div class="logo-upload-stub">
                   <div class="upload-trigger" @click="$refs.logoInput.click()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>Upload New Logo</span>
                   </div>
                   <input type="file" ref="logoInput" class="hidden" accept="image/*" @change="handleFileUpload($event, 'logo')" />
                </div>
               </div>
             </div>

            <div class="logo-config-row mt-4">
              <div class="logo-preview-box logo-preview-box--dark">
                <span class="preview-label">Dark Preview</span>
                <div class="preview-content">
                  <div v-if="form.darkLogo" class="preview-img">
                    <img :src="form.darkLogo" alt="dark logo" />
                  </div>
                  <div v-else class="preview-placeholder preview-placeholder--dark">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                </div>
                <button v-if="form.darkLogo" class="preview-remove-btn" @click="form.darkLogo = ''" title="Remove dark logo">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="logo-inputs">
                <label>Dark Mode Application Logo</label>
                <div class="logo-upload-stub">
                   <div class="upload-trigger" @click="$refs.darkLogoInput.click()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>Upload Dark Mode Logo</span>
                   </div>
                   <input type="file" ref="darkLogoInput" class="hidden" accept="image/*" @change="handleFileUpload($event, 'darkLogo')" />
                </div>
                <p class="field-hint">Shown automatically when the app is in dark mode. Leave blank to use the default logo.</p>
              </div>
            </div>

            <!-- Favicon Section -->
            <div class="favicon-section mt-6">
              <label class="section-label">Browser Tab Icons (Favicon)</label>
              <div class="favicon-config-row">
                <div class="favicon-item">
                  <span class="favicon-label">Light Theme</span>
                  <div class="favicon-preview-box">
                    <div v-if="form.favicon" class="favicon-img">
                      <img :src="form.favicon" alt="favicon" />
                    </div>
                    <div v-else class="favicon-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                    </div>
                  </div>
                  <div class="favicon-upload-btn">
                    <div class="upload-trigger" @click="$refs.faviconInput.click()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>{{ form.favicon ? 'Change' : 'Upload' }}</span>
                    </div>
                    <input type="file" ref="faviconInput" class="hidden" accept="image/*" @change="handleFileUpload($event, 'favicon')" />
                  </div>
                  <button v-if="form.favicon" class="preview-remove-btn" @click="form.favicon = ''" title="Remove favicon">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="favicon-item">
                  <span class="favicon-label">Dark Theme</span>
                  <div class="favicon-preview-box favicon-preview-box--dark">
                    <div v-if="form.darkFavicon" class="favicon-img">
                      <img :src="form.darkFavicon" alt="dark favicon" />
                    </div>
                    <div v-else class="favicon-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                    </div>
                  </div>
                  <div class="favicon-upload-btn">
                    <div class="upload-trigger" @click="$refs.darkFaviconInput.click()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>{{ form.darkFavicon ? 'Change' : 'Upload' }}</span>
                    </div>
                    <input type="file" ref="darkFaviconInput" class="hidden" accept="image/*" @change="handleFileUpload($event, 'darkFavicon')" />
                  </div>
                  <button v-if="form.darkFavicon" class="preview-remove-btn" @click="form.darkFavicon = ''" title="Remove dark favicon">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <p class="field-hint">Recommended size: 32x32 or 16x16 pixels. PNG or ICO format.</p>
            </div>

          </div>
        </section>

        <section class="settings-card mt-6">
          <div class="card-header">
            <h3 class="card-title">Localization</h3>
            <p class="card-subtitle">Set regional and language preferences.</p>
          </div>
          <div class="card-body">
            <div class="grid-2">
              <div class="input-group">
                <label>Default Language</label>
                <div class="select-wrapper">
                  <select v-model="form.language" class="base-select">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <div class="select-chevron">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
              <div class="input-group">
                <label>Timezone</label>
                <div class="select-wrapper">
                  <select v-model="form.timezone" class="base-select">
                    <option value="UTC">UTC (Greenwich Mean Time)</option>
                    <option value="PKT">PKT (Pakistan Standard Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                  <div class="select-chevron">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Visual Theme -->
      <div class="settings-column">
        <section class="settings-card">
          <div class="card-header">
            <h3 class="card-title">Design & Theme</h3>
            <p class="card-subtitle">Customize the colors and visual style of the application.</p>
          </div>
          <div class="card-body">
            <div class="input-group">
              <label>Brand Color</label>
              <div class="color-picker-row">
                <input type="color" v-model="form.colorScheme" class="color-swatch-btn" />
                <input type="text" v-model="form.colorScheme" class="base-input flex-1" placeholder="#10B981" />
              </div>
              <div class="color-presets">
                 <button v-for="c in ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#111827']" 
                         :key="c" 
                         class="preset-dot" 
                         :style="{ backgroundColor: c }"
                         @click="form.colorScheme = c"></button>
              </div>
            </div>

            <div class="input-group mt-6">
              <label>Footer Text</label>
              <textarea v-model="form.footerText" class="base-textarea" placeholder="Copyright information..."></textarea>
            </div>
          </div>
        </section>

        <section class="settings-card mt-6">
            <div class="card-header">
               <h3 class="card-title">Typography & Fonts</h3>
               <p class="card-subtitle">Select the primary typeface for the application.</p>
            </div>
            <div class="card-body">
               <div class="input-group">
                  <label>Primary Font Stack</label>
                  <div class="select-wrapper">
                    <select v-model="form.fontFamily" class="base-select">
                      <option value="'Inter', system-ui, sans-serif">Inter (Modern Sans)</option>
                      <option value="'Roboto', sans-serif">Roboto (Clean Sans)</option>
                      <option value="'Outfit', sans-serif">Outfit (Premium Rounded)</option>
                      <option value="'DM Sans', sans-serif">DM Sans (Professional)</option>
                      <option value="'Poppins', sans-serif">Poppins (Playful & Bold)</option>
                      <option value="'Geist', monospace">Geist (Developer Aesthetic)</option>
                    </select>
                    <div class="select-chevron">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                  <div class="font-preview mt-3" :style="{ fontFamily: form.fontFamily }">
                     The quick brown fox jumps over the lazy dog. 1234567890
                  </div>
               </div>
            </div>
        </section>

        <section class="settings-card mt-6">
            <div class="card-header">
               <h3 class="card-title">Advanced Configuration</h3>
               <p class="card-subtitle">Optional system-level flags.</p>
            </div>
            <div class="card-body">
               <div class="toggle-row" @click="form.publicRegistration = !form.publicRegistration">
                  <div class="toggle-info">
                     <span class="toggle-title">Public Registration</span>
                     <span class="toggle-desc">Allow new users to create accounts without invitation.</span>
                  </div>
                  <div class="toggle-switch" :class="{ active: form.publicRegistration }"></div>
               </div>
               <div class="toggle-row mt-4" @click="form.maintenanceMode = !form.maintenanceMode">
                  <div class="toggle-info">
                     <span class="toggle-title">System-wide Maintenance</span>
                     <span class="toggle-desc">Lock all project modifications for a scheduled update.</span>
                  </div>
                  <div class="toggle-switch" :class="{ active: form.maintenanceMode }"></div>
               </div>
            </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { settings, updateSettings, fetchSettings } = useSettings()
const saving = ref(false)

const form = reactive({
  name: '',
  logo: '',
  darkLogo: '',
  favicon: '',
  darkFavicon: '',
  colorScheme: '',
  footerText: '',
  language: '',
  timezone: '',
  publicRegistration: false,
  maintenanceMode: false,
  fontFamily: ''
})

onMounted(async () => {
  await fetchSettings()
  Object.assign(form, settings.value)
})

const { addToast } = useToast()

const save = async () => {
  saving.value = true
  const success = await updateSettings({ ...form })
  if (success) {
    addToast('Configuration Saved Successfully', 'success')
    setTimeout(() => saving.value = false, 500)
  } else {
    addToast('Failed to save settings', 'error')
    saving.value = false
  }
}

const handleFileUpload = async (event: Event, type: 'logo' | 'darkLogo' | 'favicon' | 'darkFavicon') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    if (type === 'logo') form.logo = response.url
    else if (type === 'darkLogo') form.darkLogo = response.url
    else if (type === 'favicon') form.favicon = response.url
    else if (type === 'darkFavicon') form.darkFavicon = response.url
  } catch (e) {
    console.error('Upload failed')
  }
}
</script>

<style scoped>
.settings-workspace {
  padding: 2.5rem;
  width: 100%;
  box-sizing: border-box;
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
  background: v-bind('form.colorScheme');
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 20px -5px v-bind('form.colorScheme + "40"');
}

.btn-save-settings:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 15px 30px -5px v-bind('form.colorScheme + "60"');
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
  color: var(--color-text-muted);
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
  font-weight: 600;
  outline: none;
  transition: all 0.2s;
}

.base-select {
  appearance: none;
  cursor: pointer;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.select-chevron {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
  transition: 0.2s;
}

.base-select:focus + .select-chevron {
  color: v-bind('form.colorScheme');
}

.base-input:focus, .base-select:focus, .base-textarea:focus {
  background: var(--color-bg-card);
  border-color: v-bind('form.colorScheme');
  box-shadow: 0 0 0 4px v-bind('form.colorScheme + "10"');
}

.base-textarea {
  min-height: 100px;
  resize: vertical;
}

.logo-config-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-top: 1.5rem;
}

.logo-preview-box {
  flex-shrink: 0;
  width: 120px;
  background: var(--color-bg-main);
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.preview-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--color-danger, #EF4444);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.85;
  transition: opacity 0.15s, transform 0.15s;
}

.preview-remove-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.preview-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.preview-content {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.logo-inputs label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0;
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem;
  background: var(--color-bg-card);
  border: 2px dashed var(--color-border);
  border-radius: 16px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.upload-trigger:hover {
  border-color: v-bind('form.colorScheme');
  color: v-bind('form.colorScheme');
  background: v-bind('form.colorScheme + "05"');
}

.favicon-row {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-upload {
  width: 48px;
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: 0.2s;
}

.btn-icon-upload:hover {
  border-color: v-bind('form.colorScheme');
  color: v-bind('form.colorScheme');
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.color-picker-row {
  display: flex;
  gap: 0.75rem;
}

.color-swatch-btn {
  -webkit-appearance: none;
  width: 50px;
  height: 48px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  cursor: pointer;
  background: var(--color-bg-card);
}

.color-swatch-btn::-webkit-color-swatch-wrapper { padding: 0; }
.color-swatch-btn::-webkit-color-swatch { border: none; border-radius: 8px; }

.color-presets {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.preset-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-bg-card);
  box-shadow: 0 0 0 1.5px var(--color-border);
  cursor: pointer;
  transition: transform 0.2s;
}

.preset-dot:hover {
  transform: scale(1.2);
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-bg-main);
  border-radius: 18px;
  border: 1.5px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-row:hover {
  background: white;
  border-color: v-bind('form.colorScheme + "40"');
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.toggle-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  font-weight: 500;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: #E5E7EB;
  border-radius: 20px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.active {
  background: v-bind('form.colorScheme');
}

.toggle-switch::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-switch.active::after {
  left: 25px;
}

.font-preview {
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--color-bg-main);
  border: 1.5px dashed var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  transition: all 0.3s ease;
}

.settings-card:hover .font-preview {
  border-color: v-bind('form.colorScheme + "60"');
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hidden { display: none; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }
.flex-1 { flex: 1; }

.logo-preview-box--dark {
  background: #1F2937;
  border-color: #374151;
}

.logo-preview-box--dark .preview-label {
  color: #9CA3AF;
}

.preview-placeholder--dark {
  color: #6B7280;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
  font-weight: 500;
  line-height: 1.4;
}

.favicon-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.favicon-config-row {
  display: flex;
  gap: 2rem;
}

.favicon-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  position: relative;
}

.favicon-item .preview-remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.favicon-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.favicon-preview-box {
  width: 48px;
  height: 48px;
  background: var(--color-bg-main);
  border: 1.5px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.favicon-preview-box--dark {
  background: #1F2937;
  border-color: #374151;
}

.favicon-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.favicon-placeholder {
  color: var(--color-text-muted);
}

.favicon-upload-btn {
  display: flex;
  align-items: center;
}

.favicon-upload-btn .upload-trigger {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}
</style>
