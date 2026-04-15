export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, loading, initAuth } = useAuth()

  if (loading.value) {
    return
  }

  if (!useAuth().initialized) {
    await initAuth()
  }

  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/workspace/dashboard')
  }
})