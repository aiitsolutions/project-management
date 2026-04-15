<template>
  <div class="dashboard-content" :style="{ '--primary-color': primaryColor }">
    <div class="dashboard-header-row">
      <div class="dashboard-titles">
        <h1>Users Management</h1>
        <p>Manage and organize all users in your system.</p>
      </div>
      <div class="header-actions-right">
        <button class="btn-primary" @click="openCreateModal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M8 3V13M3 8H13"/>
          </svg>
          Add User
        </button>
      </div>
    </div>

    <div class="users-table-container">
      <div v-if="loading" class="empty-state">Loading users...</div>
      <div v-else-if="filteredUsers.length === 0" class="empty-state">No users found.</div>
      
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="userItem in paginatedUsers" :key="userItem.id">
            <td>
              <div class="user-cell">
                <div class="avatar-wrapper">
                  <img v-if="userItem.profile_photo" :src="userItem.profile_photo" alt="avatar" class="user-avatar" />
                  <img v-else :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name)}&background=${primaryColor.replace('#','')}&color=fff&size=80`" alt="avatar" class="user-avatar" />
                </div>
                <span class="user-name-cell">{{ userItem.name }}</span>
              </div>
            </td>
            <td>{{ userItem.email }}</td>
            <td>
              <span class="status-badge" :class="userItem.is_active ? 'status-active' : 'status-inactive'">
                {{ userItem.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formatDate(userItem.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-view" @click="$router.push(`/workspace/users/${userItem.id}`)" title="View Profile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="btn-status" @click="toggleStatus(userItem)" :title="userItem.is_active ? 'Deactivate' : 'Activate'">
                  <svg v-if="userItem.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="16 12 12 8 8 12"/>
                    <line x1="12" y1="16" x2="12" y2="8"/>
                  </svg>
                </button>
                <button class="btn-edit" @click="editUser(userItem)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-delete" @click="deleteUser(userItem.id)" :disabled="currentUser?.id === userItem.id">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredUsers.length > 0" class="pagination-container">
      <div class="pagination-info">
        Showing {{ paginatedUsers.length > 0 ? (currentPage - 1) * perPage + 1 : 0 }} to {{ Math.min(currentPage * perPage, filteredUsers.length) }} of {{ filteredUsers.length }} users
      </div>
      <div class="pagination-controls">
        <div class="show-entries">
          <span>Show</span>
          <select v-model="perPage" class="per-page-select">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <span>entries</span>
        </div>
        <div class="page-buttons">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
          </button>
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-number" 
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveUser" class="modal-form">
          <div class="profile-photo-section">
            <label>Profile Photo</label>
            <div class="photo-upload-area">
              <div class="photo-preview" :class="{ 'has-photo': form.profile_photo }">
                <img v-if="form.profile_photo" :src="form.profile_photo" alt="preview" />
                <div v-else class="photo-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              <div class="photo-actions">
                <input type="file" ref="photoInput" @change="handlePhotoUpload" accept="image/*" class="hidden-input" />
                <button type="button" class="btn-upload-photo" @click="$refs.photoInput.click()" :disabled="uploadingPhoto">
                  {{ uploadingPhoto ? 'Uploading...' : (form.profile_photo ? 'Change Photo' : 'Upload Photo') }}
                </button>
                <button v-if="form.profile_photo" type="button" class="btn-remove-photo" @click="removePhoto">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" v-model="form.name" required placeholder="Enter full name" />
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" v-model="form.email" required placeholder="Enter email address" />
            </div>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>{{ isEditing ? 'New Password (leave blank to keep current)' : 'Password' }}</label>
              <input type="password" v-model="form.password" :required="!isEditing" placeholder="Enter password" />
            </div>
            <div class="input-group" v-if="isEditing">
              <label>Status</label>
              <div class="toggle-wrapper">
                <label class="toggle">
                  <input type="checkbox" v-model="form.is_active" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (isEditing ? 'Update User' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { settings: appSettings } = useSettings()
const primaryColor = ref(appSettings.value.colorScheme || '#10B981')

const fetchSettings = async () => {
  try {
    const data = await $fetch('/api/settings')
    if (data?.colorScheme) {
      primaryColor.value = data.colorScheme
    }
  } catch (e) {
    console.error('Failed to fetch settings', e)
  }
}

onMounted(() => {
  fetchSettings()
  fetchUsers()
})

interface UserItem {
  id: number
  name: string
  email: string
  profile_photo: string | null
  is_active: boolean
  createdAt: string
  updatedAt: string
}

const { user: currentUser } = useAuth()
const users = ref<UserItem[]>([])
const loading = ref(false)
const saving = ref(false)
const uploadingPhoto = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')

const defaultForm = {
  id: null as number | null,
  name: '',
  email: '',
  password: '',
  profile_photo: null as string | null,
  is_active: true
}

const form = ref({ ...defaultForm })

const currentPage = ref(1)
const perPage = ref(10)

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredUsers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    }
  }
  return pages
})

watch(perPage, () => {
  currentPage.value = 1
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.name.toLowerCase().includes(query) || 
    u.email.toLowerCase().includes(query)
  )
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const data = await $fetch<UserItem[]>('/api/users')
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  form.value = { ...defaultForm }
  isEditing.value = false
  showModal.value = true
}

const editUser = (userItem: UserItem) => {
  form.value = {
    id: userItem.id,
    name: userItem.name,
    email: userItem.email,
    password: '',
    profile_photo: userItem.profile_photo,
    is_active: userItem.is_active
  }
  isEditing.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = { ...defaultForm }
  isEditing.value = false
}

const handlePhotoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploadingPhoto.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    form.value.profile_photo = response.url
  } catch (error) {
    console.error('Photo upload failed:', error)
    alert('Failed to upload photo.')
  } finally {
    uploadingPhoto.value = false
  }
}

const removePhoto = () => {
  form.value.profile_photo = null
}

const { addToast } = useToast()

const toggleStatus = async (userItem: UserItem) => {
  try {
    const newState = !userItem.is_active
    await $fetch(`/api/users?id=${userItem.id}`, {
      method: 'PUT',
      body: { is_active: newState }
    })
    addToast(`User ${newState ? 'Activated' : 'Deactivated'}`, 'info')
    await fetchUsers()
  } catch (error: any) {
    addToast('Failed to update status', 'error')
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    const isEditingMode = isEditing.value && form.value.id
    if (isEditingMode) {
      const updateData: any = {
        name: form.value.name,
        email: form.value.email,
        is_active: form.value.is_active
      }
      if (form.value.password) {
        updateData.password = form.value.password
      }
      if (form.value.profile_photo !== undefined) {
        updateData.profile_photo = form.value.profile_photo
      }
      await $fetch(`/api/users?id=${form.value.id}`, {
        method: 'PUT',
        body: updateData
      })
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: form.value.name,
          email: form.value.email,
          password: form.value.password,
          profile_photo: form.value.profile_photo,
          is_active: form.value.is_active
        }
      })
    }
    addToast(isEditingMode ? 'User Updated Successfully' : 'New User Created', 'success')
    await fetchUsers()
    closeModal()
  } catch (error: any) {
    addToast('Failed to save user', 'error')
  } finally {
    saving.value = false
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    await $fetch(`/api/users?id=${id}`, { method: 'DELETE' })
    addToast('User Deleted Successfully', 'success')
    await fetchUsers()
  } catch (error: any) {
    addToast('Failed to delete user', 'error')
  }
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.dashboard-content { flex: 1; display: flex; flex-direction: column; }
.dashboard-header-row { display: flex; justify: space-between; align-items: flex-end; margin-bottom: 2rem; }
.dashboard-titles h1 { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.5rem 0; }
.dashboard-titles p { color: var(--color-text-muted); font-size: 0.95rem; margin: 0; }

.header-actions-right { display: flex; align-items: center; gap: 1rem; }
.btn-primary { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.users-table-container { background: var(--color-bg-card); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid var(--color-border); }
.empty-state { text-align: center; padding: 4rem; color: var(--color-text-muted); font-size: 0.95rem; }

.users-table { width: 100%; border-collapse: collapse; }
.users-table th { text-align: left; padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg-subtle); border-bottom: 1px solid var(--color-border); }
.users-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border-light); font-size: 0.9rem; color: var(--color-text-secondary); }
.users-table tr:hover { background: var(--color-bg-main); }

.user-cell { display: flex; align-items: center; gap: 1rem; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.user-name-cell { font-weight: 600; color: var(--color-text-primary); }

.status-badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.status-active { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.status-inactive { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-edit, .btn-delete, .btn-status, .btn-view { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-view { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.btn-edit { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.btn-status { background: var(--color-bg-main); color: var(--color-text-muted); }
.btn-delete { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-container { background: var(--color-bg-card); width: 100%; max-width: 550px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid var(--color-border); }
.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; }
.modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.photo-upload-area { display: flex; align-items: center; gap: 1.5rem; margin-top: 0.5rem; }
.photo-preview { width: 80px; height: 80px; border-radius: 50%; background: var(--color-bg-main); border: 2px dashed var(--color-border); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.photo-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.btn-upload-photo { background: var(--color-bg-main); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.input-group label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
.input-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.95rem; outline: none; background: var(--color-bg-main); color: var(--color-text-primary); }
.input-group input:focus { border-color: var(--primary-color); }

.toggle-wrapper { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
.toggle { position: relative; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--color-border); transition: .4s; border-radius: 24px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: var(--color-bg-card); transition: .4s; border-radius: 50%; }
.toggle input:checked + .toggle-slider { background: var(--primary-color); }
.toggle input:checked + .toggle-slider:before { transform: translateX(20px); }

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-save { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: var(--color-bg-main); border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; color: var(--color-text-secondary); cursor: pointer; }

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-bg-card);
  border-radius: 16px;
  margin-top: 1rem;
  border: 1px solid var(--color-border);
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.show-entries {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.per-page-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  cursor: pointer;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-card);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  background: var(--color-bg-subtle);
}

.page-number.active {
  background: var(--primary-color);
  color: white;
}
</style>
