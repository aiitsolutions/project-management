import { ref, onMounted } from 'vue'

export interface Settings {
  name: string
  logo: string
  darkLogo: string
  favicon: string
  darkFavicon: string
  colorScheme: string
  footerText: string
  language: string
  timezone: string
  fontFamily: string
  publicRegistration: boolean
  maintenanceMode: boolean
}

export const useSettings = () => {
  const settings = useState<Settings>('app-settings', () => ({
    name: "Antigravity",
    logo: "",
    darkLogo: "",
    favicon: "/favicon.ico",
    darkFavicon: "",
    colorScheme: "#10B981",
    footerText: "© 2026 Antigravity Project Management. All rights reserved.",
    language: "en",
    timezone: "UTC",
    fontFamily: "'Inter', system-ui, sans-serif",
    publicRegistration: true,
    maintenanceMode: false
  }))

  const loading = ref(false)

  const fetchSettings = async () => {
    loading.value = true
    try {
      const data = await $fetch<Settings>('/api/settings')
      // Merge with defaults to ensure new fields like fontFamily are always present
      const merged = {
        fontFamily: "'Inter', system-ui, sans-serif",
        darkLogo: "",
        ...data
      }
      settings.value = merged
      updateAppIdentity(merged)
    } catch (e) {
      console.error('Failed to fetch settings', e)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: Settings) => {
    try {
      await $fetch('/api/settings', {
        method: 'PUT',
        body: newSettings
      })
      settings.value = newSettings
      updateAppIdentity(newSettings)
      return { success: true }
    } catch (e) {
      console.error('Failed to update settings', e)
      return { success: false, error: e }
    }
  }

  // Maps font-family CSS values to their Google Fonts import names
  const GOOGLE_FONT_MAP: Record<string, string> = {
    "'Roboto', sans-serif": 'Roboto:wght@400;500;700',
    "'Outfit', sans-serif": 'Outfit:wght@400;500;600;700;800;900',
    "'DM Sans', sans-serif": 'DM+Sans:wght@400;500;600;700',
    "'Poppins', sans-serif": 'Poppins:wght@400;500;600;700;800',
    "'Geist', monospace": 'Geist:wght@400;500;700'
  }

  const loadGoogleFont = (fontFamily: string) => {
    const googleSpec = GOOGLE_FONT_MAP[fontFamily]
    if (!googleSpec) return // Inter or system font, no load needed

    const linkId = 'dynamic-google-font'
    let link = document.getElementById(linkId) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = `https://fonts.googleapis.com/css2?family=${googleSpec}&display=swap`
  }

  const updateAppIdentity = (data: Settings) => {
    if (process.client) {
      document.title = data.name
      
      // Update favicon based on theme
      const updateFavicon = () => {
        const isDark = document.documentElement.classList.contains('dark-theme')
        const faviconUrl = (isDark && data.darkFavicon) ? data.darkFavicon : (data.favicon || '/favicon.ico')
        
        let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
        if (!favicon) {
          favicon = document.createElement('link')
          favicon.rel = 'shortcut icon'
          document.head.appendChild(favicon)
        }
        favicon.href = faviconUrl
        
        // Update theme-color meta
        let themeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement
        if (!themeColor) {
          themeColor = document.createElement('meta')
          themeColor.name = 'theme-color'
          document.head.appendChild(themeColor)
        }
        themeColor.content = data.colorScheme || '#10B981'
      }
      
      updateFavicon()
      
      // Listen for theme changes to update favicon dynamically
      const observer = new MutationObserver(() => {
        updateFavicon()
      })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      
      // Update CSS Variables for color scheme
      const primaryColor = data.colorScheme || '#10B981'
      document.documentElement.style.setProperty('--primary-color', primaryColor)
      document.documentElement.style.setProperty('--primary-color-light', primaryColor)
      document.documentElement.style.setProperty('--primary-color-bg', primaryColor + '10')
      document.documentElement.style.setProperty('--primary-color-alpha', primaryColor + '40')
      // Nav active state — light tint of brand color for bg, slightly more opaque for border
      document.documentElement.style.setProperty('--nav-active-bg', primaryColor + '15')
      document.documentElement.style.setProperty('--nav-active-border', primaryColor + '40')

      // Load Google Font if needed, then apply via CSS variable
      if (data.fontFamily) {
        loadGoogleFont(data.fontFamily)
        document.documentElement.style.setProperty('--font-family', data.fontFamily)
      }
    }
  }

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings
  }
}
