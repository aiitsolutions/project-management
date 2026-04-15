<template>
  <div class="user-view-page" :style="{ '--primary-color': primaryColor }">

    <!-- Back Navigation -->
    <div class="back-nav">
      <button class="btn-back" @click="router.push('/workspace/users')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Users
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-shell">
      <div class="profile-hero skeleton-hero">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line narrow"></div>
          <div class="skeleton-line narrow"></div>
        </div>
      </div>
    </div>

    <!-- User Not Found -->
    <div v-else-if="!userProfile" class="not-found-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <h3>User Not Found</h3>
      <p>This user does not exist or has been removed.</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Profile Hero Card -->
      <div class="profile-hero-card">
        <div class="hero-accent-bar"></div>
        <div class="hero-body">
          <div class="hero-avatar-wrap">
            <img :src="avatarSrc" :alt="userProfile.name" class="hero-avatar" />
            <span class="status-dot" :class="userProfile.is_active ? 'active' : 'inactive'"></span>
          </div>
          <div class="hero-info">
            <div class="hero-name-row">
              <h1 class="hero-name">{{ userProfile.name }}</h1>
              <span class="status-pill" :class="userProfile.is_active ? 'active' : 'inactive'">
                {{ userProfile.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="hero-meta-row">
              <div class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {{ userProfile.email }}
              </div>
              <div class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Member since {{ formatDateLong(userProfile.createdAt) }}
              </div>
              <div v-if="userProfile.two_factor_enabled" class="meta-chip secure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                2FA Enabled
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-edit-user" @click="openEditModal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon items-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ assignedItems.length }}</span>
            <span class="stat-label">Assigned Items</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teams-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ userTeams.length }}</span>
            <span class="stat-label">Teams</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon done-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ completedItems.length }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ inProgressItems.length }}</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">

        <!-- Assigned Items -->
        <div class="content-card items-card">
          <div class="card-header">
            <div class="card-title-group">
              <h3 class="card-title">Assigned Items</h3>
              <span class="count-badge">{{ assignedItems.length }}</span>
            </div>
            <!-- Filter tabs -->
            <div class="filter-tabs">
              <button
                v-for="tab in itemTabs"
                :key="tab.value"
                class="filter-tab"
                :class="{ active: itemFilter === tab.value }"
                @click="itemFilter = tab.value"
              >{{ tab.label }}</button>
            </div>
          </div>

          <div v-if="loadingItems" class="card-loading">
            <div v-for="i in 4" :key="i" class="item-skeleton"></div>
          </div>

          <div v-else-if="filteredItems.length === 0" class="card-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>No items in this category</p>
          </div>

          <div v-else class="items-list">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="item-row"
              @click="viewItem(item)"
            >
              <div class="item-type-accent" :class="item.type?.toLowerCase()"></div>
              <div class="item-body">
                <div class="item-top-row">
                  <span class="item-uid">{{ item.uid }}</span>
                  <span class="item-type-chip" :class="item.type?.toLowerCase()">{{ item.type }}</span>
                  <span class="item-priority-chip" :class="item.priority?.toLowerCase()">{{ item.priority }}</span>
                </div>
                <div class="item-title">{{ item.title }}</div>
                <div class="item-bottom-row">
                  <span class="item-status-tag" :class="item.status?.toLowerCase().replace(' ', '-')">{{ item.status }}</span>
                  <span class="item-project">{{ getProjectName(item.projectId) }}</span>
                </div>
              </div>
              <svg class="item-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">

          <!-- Teams Card -->
          <div class="content-card teams-card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Teams</h3>
                <span class="count-badge">{{ userTeams.length }}</span>
              </div>
            </div>
            <div v-if="loadingTeams" class="card-loading">
              <div v-for="i in 3" :key="i" class="team-skeleton"></div>
            </div>
            <div v-else-if="userTeams.length === 0" class="card-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <p>Not in any team</p>
            </div>
            <div v-else class="teams-list">
              <div v-for="team in userTeams" :key="team.id" class="team-row">
                <div class="team-color-dot" :style="{ background: team.color || 'var(--primary-color)' }"></div>
                <div class="team-info">
                  <span class="team-name">{{ team.name }}</span>
                  <span class="team-member-count">{{ team.memberIds?.length || 0 }} members</span>
                </div>
                <span class="team-badge">Member</span>
              </div>
            </div>
          </div>

          <!-- Account Info Card -->
          <div class="content-card info-card">
            <div class="card-header">
              <h3 class="card-title">Account Info</h3>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">User ID</span>
                <span class="info-value mono">#{{ userProfile.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="status-pill small" :class="userProfile.is_active ? 'active' : 'inactive'">
                  {{ userProfile.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">2FA</span>
                <span class="info-value">{{ userProfile.two_factor_enabled ? 'Enabled' : 'Disabled' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Joined</span>
                <span class="info-value">{{ formatDateLong(userProfile.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Last Updated</span>
                <span class="info-value">{{ formatDateLong(userProfile.updatedAt) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Edit User</h2>
          <button class="close-btn" @click="showEditModal = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveUser" class="modal-form">
          <div class="photo-section">
            <div class="photo-preview-wrap">
              <img :src="form.profile_photo || avatarSrc" class="form-avatar" />
            </div>
            <div class="photo-upload-actions">
              <input type="file" ref="photoInput" @change="handlePhotoUpload" accept="image/*" class="hidden-input" />
              <button type="button" class="btn-upload" @click="($refs.photoInput as HTMLInputElement).click()" :disabled="uploadingPhoto">
                {{ uploadingPhoto ? 'Uploading...' : 'Change Photo' }}
              </button>
              <button v-if="form.profile_photo" type="button" class="btn-remove" @click="form.profile_photo = null">Remove</button>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" v-model="form.name" required placeholder="Full name" />
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" v-model="form.email" required placeholder="Email address" />
            </div>
          </div>

          <div class="input-group">
            <label>Status</label>
            <div class="toggle-row">
              <label class="toggle">
                <input type="checkbox" v-model="form.is_active" />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Saving...' : 'Update User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  ssr: false
})

const router = useRouter()
const route = useRoute()
const { addToast } = useToast()

const userId = computed(() => Number(route.params.id))

// Primary color
const { settings: appSettings } = useSettings()
const primaryColor = ref(appSettings.value.colorScheme || '#10B981')

// Data
const userProfile = ref<any>(null)
const allItems = ref<any[]>([])
const allTeams = ref<any[]>([])
const allProjects = ref<any[]>([])
const loading = ref(true)
const loadingItems = ref(true)
const loadingTeams = ref(true)

// Item filter
const itemFilter = ref('all')
const itemTabs = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Backlog', value: 'backlog' },
]

// Edit modal
const showEditModal = ref(false)
const saving = ref(false)
const uploadingPhoto = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)
const form = ref({ name: '', email: '', profile_photo: null as string | null, is_active: true })

// Computed
const avatarSrc = computed(() => {
  if (userProfile.value?.profile_photo) return userProfile.value.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.value?.name || 'U')}&background=10B981&color=fff&size=128`
})

const assignedItems = computed(() =>
  allItems.value.filter(i => i.teamAllocations?.some((a: any) => a.userId === userId.value))
)

const completedItems = computed(() =>
  assignedItems.value.filter(i => i.status?.toLowerCase() === 'completed')
)

const inProgressItems = computed(() =>
  assignedItems.value.filter(i => i.status?.toLowerCase() === 'in progress' || i.status?.toLowerCase() === 'in-progress')
)

const filteredItems = computed(() => {
  if (itemFilter.value === 'all') return assignedItems.value
  if (itemFilter.value === 'completed') return completedItems.value
  if (itemFilter.value === 'in-progress') return inProgressItems.value
  if (itemFilter.value === 'backlog') return assignedItems.value.filter(i => i.status?.toLowerCase() === 'backlog')
  return assignedItems.value
})

const userTeams = computed(() =>
  allTeams.value.filter(t => t.memberIds?.includes(userId.value))
)

const getProjectName = (projectId: number) => {
  const p = allProjects.value.find(p => p.id === projectId)
  return p?.name || '—'
}

// Fetch all data
const fetchAll = async () => {
  loading.value = true
  loadingItems.value = true
  loadingTeams.value = true

  try {
    const [userData, settingsData] = await Promise.all([
      $fetch<any>(`/api/users?id=${userId.value}`),
      $fetch<any>('/api/settings')
    ])
    userProfile.value = userData
    if (settingsData?.colorScheme) primaryColor.value = settingsData.colorScheme
  } catch {
    userProfile.value = null
  } finally {
    loading.value = false
  }

  try {
    const [itemsData, teamsData, projectsData] = await Promise.all([
      $fetch<any[]>('/api/items'),
      $fetch<any[]>('/api/teams'),
      $fetch<any[]>('/api/projects')
    ])
    allItems.value = itemsData || []
    allTeams.value = teamsData || []
    allProjects.value = projectsData || []
  } catch {
    // non-fatal
  } finally {
    loadingItems.value = false
    loadingTeams.value = false
  }
}

onMounted(fetchAll)

// Edit modal
const openEditModal = () => {
  form.value = {
    name: userProfile.value.name,
    email: userProfile.value.email,
    profile_photo: userProfile.value.profile_photo,
    is_active: userProfile.value.is_active
  }
  showEditModal.value = true
}

const handlePhotoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingPhoto.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: formData })
    form.value.profile_photo = res.url
  } catch {
    addToast('Photo upload failed', 'error')
  } finally {
    uploadingPhoto.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    const updated = await $fetch<any>(`/api/users?id=${userId.value}`, {
      method: 'PUT',
      body: {
        name: form.value.name,
        email: form.value.email,
        profile_photo: form.value.profile_photo,
        is_active: form.value.is_active
      }
    })
    userProfile.value = updated
    showEditModal.value = false
    addToast('User updated successfully', 'success')
  } catch {
    addToast('Failed to update user', 'error')
  } finally {
    saving.value = false
  }
}

const viewItem = (item: any) => {
  router.push(`/workspace/projects/${item.projectId}/items/${item.id}`)
}

// Formatters
const formatDateLong = (dateString: string | undefined) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.user-view-page {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  background: var(--color-bg-main);
}

/* Back Nav */
.back-nav { display: flex; align-items: center; }
.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover { border-color: var(--primary-color); color: var(--primary-color); }

/* Loading skeleton */
.loading-shell { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-hero { display: flex; align-items: center; gap: 2rem; background: var(--color-bg-card); border-radius: 20px; padding: 2rem; }
.skeleton-avatar { width: 100px; height: 100px; border-radius: 50%; background: var(--color-border-light); flex-shrink: 0; animation: shimmer 1.5s infinite; }
.skeleton-lines { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
.skeleton-line { height: 14px; border-radius: 6px; background: var(--color-border-light); animation: shimmer 1.5s infinite; }
.skeleton-line.wide { width: 60%; }
.skeleton-line.narrow { width: 35%; }
@keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Not found */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem;
  color: var(--color-text-muted);
  text-align: center;
}
.not-found-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.not-found-state p { margin: 0; font-size: 0.95rem; }

/* Hero Card */
.profile-hero-card {
  background: var(--color-bg-card);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.hero-accent-bar { height: 5px; background: var(--primary-color); }
.hero-body {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 2.5rem;
}
.hero-avatar-wrap { position: relative; flex-shrink: 0; }
.hero-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
}
.status-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--color-bg-card);
}
.status-dot.active { background: #22c55e; }
.status-dot.inactive { background: #ef4444; }

.hero-info { flex: 1; min-width: 0; }
.hero-name-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.hero-name { font-size: 1.65rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-pill.active { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.status-pill.inactive { background: rgba(239,68,68,0.1); color: #ef4444; }
.status-pill.small { font-size: 0.7rem; padding: 0.2rem 0.6rem; }

.hero-meta-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.meta-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
.meta-chip.secure { color: var(--primary-color); }

.hero-actions { flex-shrink: 0; }
.btn-edit-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-edit-user:hover { filter: brightness(0.9); transform: translateY(-1px); }

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  background: var(--color-bg-card);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.items-icon { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.teams-icon { background: rgba(59,130,246,0.1); color: #3b82f6; }
.done-icon { background: rgba(34,197,94,0.1); color: #22c55e; }
.progress-icon { background: rgba(245,158,11,0.1); color: #f59e0b; }
.stat-body { display: flex; flex-direction: column; gap: 0.15rem; }
.stat-value { font-size: 1.75rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
.stat-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

/* Cards */
.content-card {
  background: var(--color-bg-card);
  border-radius: 18px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  gap: 1rem;
  flex-wrap: wrap;
}
.card-title-group { display: flex; align-items: center; gap: 0.75rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.count-badge {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

/* Filter tabs */
.filter-tabs { display: flex; gap: 0.25rem; }
.filter-tab {
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tab:hover { background: var(--color-bg-main); color: var(--color-text-primary); }
.filter-tab.active {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
}

/* Loading / Empty states */
.card-loading { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem 1.5rem; }
.item-skeleton { height: 72px; border-radius: 12px; background: var(--color-border-light); animation: shimmer 1.5s infinite; }
.team-skeleton { height: 52px; border-radius: 10px; background: var(--color-border-light); animation: shimmer 1.5s infinite; }
.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--color-text-muted);
  text-align: center;
}
.card-empty p { margin: 0; font-size: 0.9rem; }

/* Items list */
.items-list { display: flex; flex-direction: column; }
.item-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background 0.15s;
  overflow: hidden;
}
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: var(--color-bg-main); }
.item-type-accent { width: 4px; flex-shrink: 0; }
.item-type-accent.story { background: var(--primary-color); }
.item-type-accent.task { background: #3b82f6; }
.item-type-accent.bug { background: #ef4444; }
.item-body { flex: 1; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.item-top-row { display: flex; align-items: center; gap: 0.6rem; }
.item-uid { font-family: monospace; font-size: 0.72rem; font-weight: 700; color: var(--primary-color); }
.item-type-chip {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 0.15rem 0.45rem; border-radius: 5px;
}
.item-type-chip.story { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.item-type-chip.task { background: rgba(59,130,246,0.12); color: #3b82f6; }
.item-type-chip.bug { background: rgba(239,68,68,0.12); color: #ef4444; }
.item-priority-chip {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 0.15rem 0.45rem; border-radius: 5px;
}
.item-priority-chip.high { background: rgba(239,68,68,0.12); color: #ef4444; }
.item-priority-chip.medium { background: rgba(245,158,11,0.12); color: #f59e0b; }
.item-priority-chip.low { background: rgba(34,197,94,0.12); color: #22c55e; }
.item-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.item-bottom-row { display: flex; align-items: center; gap: 0.75rem; }
.item-status-tag {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 0.15rem 0.45rem; border-radius: 5px;
  background: var(--color-border-light); color: var(--color-text-muted);
}
.item-status-tag.completed { background: rgba(34,197,94,0.12); color: #22c55e; }
.item-status-tag.in-progress { background: rgba(59,130,246,0.12); color: #3b82f6; }
.item-project { font-size: 0.75rem; color: var(--color-text-muted); }
.item-chevron { color: var(--color-border); flex-shrink: 0; align-self: center; margin-right: 1rem; }
.item-row:hover .item-chevron { color: var(--primary-color); }

/* Right column */
.right-column { display: flex; flex-direction: column; gap: 1.5rem; }

/* Teams */
.teams-list { display: flex; flex-direction: column; }
.team-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  transition: background 0.15s;
}
.team-row:last-child { border-bottom: none; }
.team-row:hover { background: var(--color-bg-main); }
.team-color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.team-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.team-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.team-member-count { font-size: 0.75rem; color: var(--color-text-muted); }
.team-badge {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 0.2rem 0.55rem; border-radius: 6px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
}

/* Account Info */
.info-list { display: flex; flex-direction: column; }
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.info-value { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
.info-value.mono { font-family: monospace; color: var(--primary-color); }

/* Edit Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-container {
  background: var(--color-bg-card);
  width: 100%;
  max-width: 520px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  border: 1px solid var(--color-border);
  overflow: hidden;
}
.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border-light);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 0.25rem; border-radius: 6px; transition: color 0.2s; }
.close-btn:hover { color: var(--color-danger); }
.modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.photo-section { display: flex; align-items: center; gap: 1.5rem; }
.photo-preview-wrap { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid var(--primary-color); }
.form-avatar { width: 100%; height: 100%; object-fit: cover; }
.photo-upload-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.hidden-input { display: none; }
.btn-upload {
  background: var(--color-bg-main); border: 1px solid var(--color-border);
  color: var(--color-text-primary); padding: 0.5rem 1rem;
  border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;
  transition: border-color 0.2s;
}
.btn-upload:hover { border-color: var(--primary-color); }
.btn-remove {
  background: transparent; border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444; padding: 0.5rem 1rem;
  border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.input-group input {
  padding: 0.75rem 1rem; border: 1.5px solid var(--color-border);
  border-radius: 10px; font-size: 0.9rem; outline: none;
  background: var(--color-bg-main); color: var(--color-text-primary);
  transition: border-color 0.2s;
}
.input-group input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 12%, transparent); }

.toggle-row { display: flex; align-items: center; gap: 0.75rem; }
.toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--color-border); transition: 0.3s; border-radius: 24px;
}
.toggle-slider:before {
  position: absolute; content: '';
  height: 18px; width: 18px; left: 3px; bottom: 3px;
  background: white; transition: 0.3s; border-radius: 50%;
}
.toggle input:checked + .toggle-slider { background: var(--primary-color); }
.toggle input:checked + .toggle-slider:before { transform: translateX(20px); }
.toggle-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary); }

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 0.5rem; }
.btn-cancel {
  background: var(--color-bg-main); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); padding: 0.7rem 1.5rem;
  border-radius: 10px; font-weight: 600; cursor: pointer;
}
.btn-save {
  background: var(--primary-color); border: none; color: white;
  padding: 0.7rem 1.75rem; border-radius: 10px; font-weight: 700; cursor: pointer;
  transition: filter 0.2s;
}
.btn-save:hover { filter: brightness(0.9); }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .hero-body { flex-wrap: wrap; }
  .stats-row { grid-template-columns: 1fr 1fr; }
  .filter-tabs { display: none; }
}
</style>
