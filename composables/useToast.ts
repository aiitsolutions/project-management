import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const addToast = (message: string, type: Toast['type'] = 'success', duration = 3000) => {
    const id = Date.now()
    toasts.value.push({ id, message, type, duration })
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
