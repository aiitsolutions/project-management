export default defineNuxtRouteMiddleware(async (to) => {
  const accessTokenCookie = useCookie('access_token')
  const { isAuthenticated, loading, initialized, refreshSession, initAuth } = useAuth()

  if (!initialized.value) {
    await initAuth()
  }

  // Wait for auth to finish before allowing navigation
  while (loading.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  const isGuestPage = to.path === '/login' || to.path === '/register' || to.path === '/install'

  if (!isAuthenticated.value && !isGuestPage) {
    const refreshed = await refreshSession()
    if (!refreshed) {
      return navigateTo('/login')
    }
  }

  if (isAuthenticated.value && isGuestPage) {
    return navigateTo('/workspace/dashboard')
  }
})