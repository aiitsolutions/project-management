<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item"
        :class="toast.type"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
        </div>
        <div class="toast-progress">
          <div 
            class="progress-bar" 
            :style="{ width: getProgress(toast.id) + '%', transition: isPaused(toast.id) ? 'none' : 'width 0.1s linear' }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
const remainingTime = ref<Record<number, number>>({})
const pausedIds = ref<Set<number>>(new Set())
let interval: any = null

const getProgress = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (!toast) return 0
  const total = toast.duration || 3000
  const remaining = remainingTime.value[id] || 0
  return (remaining / total) * 100
}

const pauseToast = (id: number) => pausedIds.value.add(id)
const resumeToast = (id: number) => pausedIds.value.delete(id)
const isPaused = (id: number) => pausedIds.value.has(id)

onMounted(() => {
  interval = setInterval(() => {
    toasts.value.forEach(toast => {
      if (pausedIds.value.has(toast.id)) return
      
      if (remainingTime.value[toast.id] === undefined) {
        remainingTime.value[toast.id] = toast.duration || 3000
      }
      
      remainingTime.value[toast.id] -= 100
      
      if (remainingTime.value[toast.id] <= 0) {
        removeToast(toast.id)
        delete remainingTime.value[toast.id]
      }
    })
  }, 100)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.12);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
}

.toast-content {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-item.success .toast-icon { background: #F0FDF4; color: #10B981; }
.toast-item.error .toast-icon { background: #FEF2F2; color: #EF4444; }
.toast-item.info .toast-icon { background: #EFF6FF; color: #3B82F6; }

.toast-msg {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1F2937;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
}

.toast-progress {
  height: 4px;
  background: rgba(0,0,0,0.03);
  width: 100%;
}

.progress-bar {
  height: 100%;
  width: 100%;
}

.toast-item.success .progress-bar { background: #10B981; }
.toast-item.error .progress-bar { background: #EF4444; }
.toast-item.info .progress-bar { background: #3B82F6; }

/* Transitions */
.toast-list-enter-active, .toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
