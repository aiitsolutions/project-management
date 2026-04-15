interface User {
  id: number
  email: string
  name: string
  profile_photo?: string | null
  two_factor_enabled?: boolean
  two_factor_method?: string | null
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const accessToken = useState<string | null>('accessToken', () => null)
  const loading = useState<boolean>('authLoading', () => true)
  const initialized = useState<boolean>('authInitialized', () => false)

  const accessTokenCookie = useCookie<string | null>('access_token')
  const refreshTokenCookie = useCookie<string | null>('refresh_token')

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const fetchUser = async () => {
    if (!accessToken.value) {
      loading.value = false
      return
    }

    try {
      const response = await $fetch<{ user: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      user.value = response.user
    } catch (error) {
      await refreshSession()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  const refreshSession = async () => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/refresh', {
        method: 'POST'
      })
      
      accessToken.value = response.accessToken
      accessTokenCookie.value = response.accessToken
      user.value = response.user
      
      return true
    } catch (error) {
      await logout(false)
      return false
    }
  }

  const login = async (email: string, password: string, twoFactorCode?: string, rememberDevice?: boolean) => {
    try {
      const response = await $fetch<any>('/api/auth/login', {
        method: 'POST',
        body: { email, password, twoFactorCode, rememberDevice }
      })
      
      if (response.requires2FA) {
        return { success: true, requires2FA: true, method: response.method || 'authenticator' }
      }
      
      accessToken.value = response.accessToken
      accessTokenCookie.value = response.accessToken
      user.value = response.user
      
      if (response.refreshToken) {
        refreshTokenCookie.value = response.refreshToken
      }
      
      return { success: true }
    } catch (error: any) {
      const message = error.data?.statusMessage || 'Login failed'
      return { success: false, error: message }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })
      
      accessToken.value = response.accessToken
      accessTokenCookie.value = response.accessToken
      user.value = response.user
      
      if (response.refreshToken) {
        refreshTokenCookie.value = response.refreshToken
      }
      
      return { success: true }
    } catch (error: any) {
      const message = error.data?.statusMessage || 'Registration failed'
      return { success: false, error: message }
    }
  }

  const logout = async (redirect = true) => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore errors
    }
    
    user.value = null
    accessToken.value = null
    accessTokenCookie.value = null
    refreshTokenCookie.value = null
    
    if (redirect) {
      return navigateTo('/login')
    }
  }

  const initAuth = async () => {
    if (initialized.value) return
    
    const token = accessTokenCookie.value
    if (token) {
      accessToken.value = token
      await fetchUser()
    } else {
      loading.value = false
      initialized.value = true
    }
  }

  return {
    user,
    accessToken,
    loading,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    refreshSession,
    initAuth,
    fetchUser
  }
}