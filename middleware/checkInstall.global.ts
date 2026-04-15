export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    const publicRoutes = ['/install', '/login', '/register', '/forgot-password', '/reset-password']
    if (publicRoutes.includes(to.path)) {
      return
    }
    
    try {
      const { data } = await $fetch('/api/config')
      const isInstalled = data?.installed
      
      if (!isInstalled) {
        return navigateTo('/install')
      }
    } catch (e) {
      return navigateTo('/install')
    }
  }
})