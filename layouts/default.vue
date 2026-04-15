<template>
  <div class="admin-layout">
    <!-- GLOBAL SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="logo">
          <div v-if="settings.logo" class="logo-img-wrap">
            <img :src="isDark && settings.darkLogo ? settings.darkLogo : settings.logo" alt="logo" class="sidebar-logo-img" />
          </div>
          <div v-else class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36ZM18 29.5C24.3513 29.5 29.5 24.3513 29.5 18C29.5 11.6487 24.3513 6.5 18 6.5C11.6487 6.5 6.5 11.6487 6.5 18C6.5 24.3513 11.6487 29.5 18 29.5Z" :fill="settings.colorScheme"/>
              <circle cx="18" cy="18" r="8" :fill="settings.colorScheme"/>
              <circle cx="18" cy="18" r="3" fill="var(--color-bg-card)"/>
            </svg>
          </div>
          <span class="logo-text">{{ settings.name }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group">
          <span class="nav-header">MENU</span>
          <ul class="nav-list">
            <li>
              <NuxtLink to="/workspace/dashboard" class="nav-item" active-class="active">
                <span class="active-indicator"></span>
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1"/>
                    <rect x="14" y="3" width="7" height="5" rx="1"/>
                    <rect x="14" y="12" width="7" height="9" rx="1"/>
                    <rect x="3" y="16" width="7" height="5" rx="1"/>
                  </svg>
                </div>
                <span>Dashboard</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/workspace/projects" class="nav-item" :class="{ 'active': route.path.startsWith('/workspace/projects') }" active-class="active">
                <span class="active-indicator"></span>
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <span>Projects</span>
              </NuxtLink>
            </li>
           </ul>
         </div>

        <div class="nav-group">
          <span class="nav-header">WORKSPACE</span>
          <ul class="nav-list">
            <li>
              <NuxtLink to="/workspace/users" class="nav-item" active-class="active">
                <span class="active-indicator"></span>
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span>Users</span>
              </NuxtLink>
            </li>
            <li class="nav-item-wrap">
              <div class="nav-item-collapsible" :class="{ 'expanded': settingsExpanded }">
                <div class="nav-item" @click="settingsExpanded = !settingsExpanded" :class="{ 'active': route.path.startsWith('/workspace/settings') && !route.path.includes('/roles'), 'parent-active': route.path.startsWith('/workspace/settings') }">
                  <span class="active-indicator"></span>
                  <div class="nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <span class="nav-text">Settings</span>
                  <svg class="chevron-icon" :class="{ 'rotate': settingsExpanded }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                <transition name="submenu">
                  <div v-show="settingsExpanded" class="sub-nav-container">
                    <NuxtLink to="/workspace/settings/general" class="sub-nav-item" active-class="active">
                      <div class="sub-dot"></div>
                      <span>General Settings</span>
                    </NuxtLink>
                    <NuxtLink to="/workspace/settings/workspace" class="sub-nav-item" active-class="active">
                      <div class="sub-dot"></div>
                      <span>Workspace Settings</span>
                    </NuxtLink>
                  </div>
                </transition>
              </div>
            </li>
            <li>
              <NuxtLink to="/workspace/teams" class="nav-item" active-class="active">
                <span class="active-indicator"></span>
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span>Teams</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/workspace/settings/roles" class="nav-item" active-class="active">
                <span class="active-indicator"></span>
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <span>Roles & Permissions</span>
              </NuxtLink>
            </li>
            <li @click="logout" style="cursor: pointer;">
              <div class="nav-item logout-item">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <span>Logout</span>
              </div>
            </li>
          </ul>
        </div>
      </nav>


    </aside>

    <!-- MAIN CONTENT AREA -->
    <main class="main-content">
      <header class="top-header">
        <div class="search-wrap">
          <div class="search-bar">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="8" r="5"/>
              <path d="M15 15L11 11"/>
            </svg>
            <input type="text" placeholder="Search anything (⌘F)" />
            <span class="cmd-k">⌘ F</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="icon-btn theme-toggle" @click="toggleTheme" title="Toggle Theme">
            <svg v-if="theme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <button class="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"></path>
              <path d="M13.73 21A2 2 0 0 1 10.27 21"></path>
            </svg>
          </button>
          
          <div class="user-dropdown" @click="isMenuOpen = !isMenuOpen">
            <img v-if="user?.profile_photo" :src="user.profile_photo" alt="User" class="avatar-img" />
            <img v-else :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=${primaryColor}&color=fff`" alt="User" class="avatar-img" />
            <div class="user-info">
              <span class="user-name">{{ user?.name || 'Loading...' }}</span>
              <span v-if="userTeam" class="user-team" :style="{ color: userTeam.color }">{{ userTeam.name }}</span>
            </div>
            <svg class="chevron-img" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <div v-if="isMenuOpen" class="dropdown-menu">
              <NuxtLink to="/workspace/profile" class="dropdown-item">Profile</NuxtLink>
              <button @click="logout" class="dropdown-item logout">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <div class="layout-slot-wrapper">
        <slot />
      </div>
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, initAuth, logout } = useAuth()
const { settings } = useSettings()

const isMenuOpen = ref(false)
const isSettingsPage = computed(() => {
  const path = route.path
  return path === '/workspace/settings/workspace' || path === '/workspace/settings/general'
})

const settingsExpanded = ref(isSettingsPage.value)
const theme = useCookie('theme', { default: () => 'light' })

const isDark = computed(() => theme.value === 'dark')
const primaryColor = computed(() => settings.value.colorScheme?.replace('#', '') || '10B981')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  updateThemeClass()
}

const teams = ref([])
const fetchTeams = async () => {
  try {
    const data = await $fetch('/api/teams')
    teams.value = data as any[]
  } catch(e) { console.error(e) }
}

const userTeam = computed(() => {
  if (!user.value || !teams.value.length) return null
  return teams.value.find((t: any) => t.memberIds?.includes(user.value.id))
})

const updateThemeClass = () => {
  if (process.client) {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }
}

onMounted(async () => {
  updateThemeClass()
  await Promise.all([
    initAuth(),
    fetchTeams()
  ])
})
</script>

<style>
/* Collapsible Sub-menu Logic */
.nav-item-wrap {
  overflow: hidden;
}

.nav-item-collapsible {
  display: flex;
  flex-direction: column;
}

.chevron-icon {
  margin-left: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-light);
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.nav-item.active-parent {
   background: var(--nav-active-bg, #F0FDF4) !important;
   color: var(--color-primary-light) !important;
   border-color: var(--nav-active-border, #A7F3D0) !important;
 }

.sub-nav-container {
  display: flex;
  flex-direction: column;
  padding: 0.1rem 0 0.5rem 2.2rem !important;
  gap: 0.15rem;
  overflow: hidden;
}

.sub-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: #64748B !important;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.sub-dot {
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.3;
  flex-shrink: 0;
}

.sub-nav-item:hover {
  background: var(--nav-hover-bg, #F1F5F9);
  color: var(--color-text-primary) !important;
  padding-left: 1rem;
}

.sub-nav-item.active {
  background: var(--nav-active-bg, #F0FDF4) !important;
  color: var(--color-primary-light) !important;
  font-weight: 700;
}

.sub-nav-item.active .sub-dot {
  opacity: 1;
  transform: scale(1.2);
}

.sub-nav-item.active {
  background: var(--nav-active-bg, #F0FDF4);
  color: var(--color-primary-light);
  font-weight: 700;
}

.sub-nav-item.active .sub-dot {
  opacity: 1;
}

/* Submenu Transition */
.submenu-enter-active, .submenu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
}

.submenu-enter-from, .submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap');

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--color-bg-main, #EFEFEF);
}

/* Ensure the slot wrapper takes full width to prevent layout shifts */
.layout-slot-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* User Dropdown Card */
.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-bg-card, #F9FAFB);
  border: 1.5px solid var(--color-border, #F1F5F9);
  border-radius: 14px;
  padding: 0.4rem 1rem 0.4rem 0.4rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  user-select: none;
}

.user-dropdown:hover {
  background: var(--nav-active-bg, #F0FDF4);
  border-color: var(--nav-active-border, #A7F3D0);
}

.user-dropdown .avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-bg-main, white);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.user-dropdown .user-info {
  display: flex;
  flex-direction: column;
}

.user-dropdown .user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  white-space: nowrap;
}

.user-dropdown .user-team {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.user-dropdown .chevron-img {
  margin-left: 0.25rem;
  transition: transform 0.2s;
}

.user-dropdown:hover .chevron-img {
  color: var(--color-primary-light);
  stroke: var(--color-primary-light);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--color-bg-card, white);
  border: 1px solid var(--color-border, #E5E7EB);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary, #374151);
  text-decoration: none;
  transition: background 0.2s;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-border-light, #F3F4F6);
  color: var(--color-text-primary, #111827);
}

.dropdown-item.logout {
  color: var(--color-danger);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

/* Sticky Header */
.top-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(239, 239, 239, 0.85); /* Matches --color-bg-main with opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem !important;
  transition: background 0.3s;
}

html.dark-theme .top-header {
  background: rgba(17, 24, 39, 0.85); /* Matches dark --color-bg-main */
}

/* Sidebar Custom Enhancements */
.sidebar {
  font-family: var(--font-family);
  border-right: 1px solid var(--color-border);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text-muted, #64748B);
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border: 1px solid transparent;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--nav-hover-bg, #F8FAFC) !important;
  color: var(--color-text-primary, #0F172A) !important;
  transform: translateX(4px);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light, #94A3B8);
  transition: color 0.2s ease;
}

.nav-item:hover .nav-icon {
  color: var(--color-text-primary, #0F172A);
}

.nav-item.active {
  background: var(--nav-active-bg, #F0FDF4) !important;
  color: var(--color-primary-light, #10B981) !important;
  border-color: var(--nav-active-border, #A7F3D0) !important;
  font-weight: 700 !important;
}

.nav-item.active .nav-icon {
  color: var(--color-primary-light, #10B981) !important;
}

/* Premium Active Indicator */
.active-indicator {
  content: '';
  position: absolute;
  left: -1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 5px !important;
  height: 28px !important;
  background: var(--color-primary-light) !important;
  border-radius: 0 4px 4px 0 !important;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.nav-item.active .active-indicator {
  opacity: 1;
  left: -1.25rem !important; /* Move based on how much distance you want to left boundary of sidebar */
}

/* Logout distinct style */
.nav-item.logout-item {
  margin-top: 1rem;
}

.nav-item.logout-item:hover {
   background: var(--nav-logout-bg, #FEF2F2) !important;
   color: var(--color-danger) !important;
 }
.nav-item.logout-item:hover .nav-icon {
   color: var(--color-danger) !important;
 }

</style>