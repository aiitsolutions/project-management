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

        <Transition name="fade" mode="out-in">
          <LoginForm v-if="view === 'login'" @switch-view="view = $event" />
          <ForgotForm v-else-if="view === 'forgot'" @switch-view="view = $event" />
          <ResetForm v-else-if="view === 'reset'" @switch-view="view = $event" />
        </Transition>
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

onMounted(() => {
  fetchSettings()
})

type AuthView = 'login' | 'forgot' | 'reset'

const view = ref<AuthView>('login')

const handleSwitch = (newView: AuthView) => {
  view.value = newView
}

provide('switch-view', handleSwitch)
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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