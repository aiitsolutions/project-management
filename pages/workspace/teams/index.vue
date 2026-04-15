<template>
  <div class="teams-page-container" :style="{ '--primary-color': primaryColor }">
    <div class="teams-header">
      <div class="header-left">
        <h1>Teams & Departments</h1>
        <p>Group users into functional units like UI/UX, Development, or QA.</p>
      </div>
      <button class="btn-create-team" @click="openCreateModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Create New Team</span>
      </button>
    </div>

    <!-- Teams Grid -->
    <div v-if="teams.length > 0" class="teams-grid">
      <div v-for="team in teams" :key="team.id" class="team-card" @click="editTeam(team)">
        <div class="team-card-top">
          <div class="team-color-badge" :style="{ backgroundColor: team.color }"></div>
          <div class="team-info">
             <h3 class="team-name">{{ team.name }}</h3>
             <p class="team-desc">{{ team.description || 'No description provided' }}</p>
          </div>
          <button class="btn-card-edit">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
        </div>
        
        <div class="team-card-footer">
          <div class="member-stack">
            <template v-for="(userId, index) in team.memberIds.slice(0, 5)" :key="userId">
              <img :src="getUserPhoto(userId)" class="stack-avatar" :style="{ zIndex: 10 - index }" :title="getUserName(userId)" />
            </template>
            <div v-if="team.memberIds.length > 5" class="stack-more">+{{ team.memberIds.length - 5 }}</div>
            <div v-if="team.memberIds.length === 0" class="no-members">No members yet</div>
          </div>
          <div class="member-count">
            <strong>{{ team.memberIds.length }}</strong> members
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="teams-empty-state">
      <div class="empty-icon">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h2>No Teams Created</h2>
      <p>Start by creating teams to organize your workforce and assign them to projects.</p>
      <button class="btn-create-team-secondary" @click="openCreateModal">Create Your First Team</button>
    </div>

    <!-- Team Form Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container team-form-modal">
          <div class="modal-header">
            <div class="modal-title-group">
              <h2>{{ form.id ? 'Edit Team' : 'Create New Team' }}</h2>
            </div>
            <button class="close-btn" @click="showModal = false">&times;</button>
          </div>

          <form @submit.prevent="saveTeam" class="modal-body custom-scrollbar">
            <div class="form-grid">
              <div class="form-section">
                <label>Team Name</label>
                <input v-model="form.name" type="text" class="form-input" placeholder="e.g., UI/UX Designers" required />
              </div>

              <div class="form-section">
                <label>Description (Optional)</label>
                <textarea v-model="form.description" class="form-input textarea" placeholder="What does this team do?"></textarea>
              </div>

              <div class="form-section">
                <label>Team Color</label>
                <div class="color-picker-grid">
                  <div v-for="c in presetColors" :key="c" 
                       class="color-option" 
                       :style="{ backgroundColor: c }"
                       :class="{ active: form.color === c }"
                       @click="form.color = c">
                    <svg v-if="form.color === c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <input type="color" v-model="form.color" class="custom-color-input" title="Choose custom color" />
                </div>
              </div>

              <div class="form-section">
                <div class="member-header">
                  <label>Team Members</label>
                  <span class="count-tag">{{ form.memberIds.length }} Selected</span>
                </div>
                <div class="user-selector-container">
                   <div class="search-box">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input v-model="userSearch" type="text" placeholder="Search users by name..." />
                   </div>
                   <div class="user-list custom-scrollbar">
                      <div v-for="user in filteredUsers" :key="user.id" 
                           class="user-card-item" 
                           :class="{ selected: form.memberIds.includes(user.id) }"
                           @click="toggleMember(user.id)">
                        <div class="uc-selected-check" v-if="form.memberIds.includes(user.id)">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <img :src="getUserPhoto(user.id)" class="uc-avatar" />
                        <div class="uc-info">
                           <span class="uc-name">{{ user.name }}</span>
                           <span class="uc-email">{{ user.email }}</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button v-if="form.id" type="button" class="btn btn-danger" @click="deleteTeam">Delete</button>
              <div style="flex: 1"></div>
              <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : (form.id ? 'Save Changes' : 'Create Team') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const teams = ref([])
const users = ref([])
const showModal = ref(false)
const saving = ref(false)
const userSearch = ref('')
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

const presetColors = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#111827']

const form = ref({
  id: null,
  name: '',
  description: '',
  color: '',
  memberIds: [] as number[]
})

const initializeFormColor = () => {
  form.value.color = primaryColor.value
}

const fetchTeams = async () => {
  try {
    const data = await $fetch('/api/teams')
    teams.value = data as any[]
  } catch(e) { console.error(e) }
}

const fetchUsers = async () => {
  try {
    const data = await $fetch('/api/users')
    users.value = data as any[]
  } catch(e) { console.error(e) }
}

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter((u: any) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const getUserName = (id: number) => users.value.find((u: any) => u.id === id)?.name || 'Unknown'
const getUserPhoto = (id: number) => {
  const user = users.value.find((u: any) => u.id === id)
  if (user?.profile_photo) return user.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10B981&color=fff`
}

const toggleMember = (id: number) => {
  const idx = form.value.memberIds.indexOf(id)
  if (idx === -1) form.value.memberIds.push(id)
  else form.value.memberIds.splice(idx, 1)
}

const openCreateModal = () => {
  form.value = { id: null, name: '', description: '', color: primaryColor.value, memberIds: [] }
  userSearch.value = ''
  showModal.value = true
}

const editTeam = (team: any) => {
  form.value = { ...team, memberIds: [...(team.memberIds || [])] }
  userSearch.value = ''
  showModal.value = true
}

const { addToast } = useToast()

const saveTeam = async () => {
  saving.value = true
  try {
    const isEditing = !!form.value.id
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/teams?id=${form.value.id}` : '/api/teams'
    
    await $fetch(url, {
      method,
      body: form.value
    })
    
    addToast(isEditing ? 'Team Updated Successfully' : 'New Team Created', 'success')
    showModal.value = false
    await fetchTeams()
  } catch (e) {
    addToast('Failed to save team', 'error')
  } finally {
    saving.value = false
  }
}

const deleteTeam = async () => {
  if (!confirm('Are you sure you want to delete this team? Members will remain as users but the group will be dissolved.')) return
  try {
    await $fetch(`/api/teams?id=${form.value.id}`, { method: 'DELETE' })
    addToast('Team Deleted Successfully', 'success')
    showModal.value = false
    await fetchTeams()
  } catch(e) {
    addToast('Failed to delete team', 'error')
  }
}

onMounted(() => {
  fetchSettings().then(() => {
    initializeFormColor()
  })
  fetchTeams()
  fetchUsers()
})
</script>

<style scoped>
.teams-page-container {
  padding: 2.5rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.teams-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: -0.04em;
  margin-bottom: 0.5rem;
}

.header-left p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  font-weight: 500;
}

.btn-create-team {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   background: var(--primary-color);
   color: white;
   border: none;
   padding: 0.9rem 1.75rem;
   border-radius: 14px;
   font-weight: 750;
   font-size: 0.95rem;
   cursor: pointer;
   transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
   box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-create-team:hover {
  background: var(--primary-color);
  filter: brightness(0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.team-card {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: 24px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}

.team-card:hover {
   border-color: var(--primary-color);
   box-shadow: 0 20px 40px rgba(0,0,0,0.04);
   transform: translateY(-4px);
 }

.team-card-top {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.team-color-badge {
  width: 12px;
  height: 48px;
  border-radius: 99px;
  flex-shrink: 0;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 1.25rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin-bottom: 0.4rem;
  letter-spacing: -0.02em;
}

.team-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-card-edit {
  background: var(--color-bg-main);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light);
  transition: 0.2s;
}

.team-card:hover .btn-card-edit {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
}

.team-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1.5px solid var(--color-border-light);
}

.member-stack {
  display: flex;
  align-items: center;
}

.stack-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-bg-card);
  margin-left: -10px;
}

.stack-avatar:first-child {
  margin-left: 0;
}

.stack-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-border-light);
  border: 2px solid var(--color-bg-card);
  margin-left: -10px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.no-members {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-style: italic;
}

.member-count {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-form-modal {
  width: 850px;
  max-width: 95vw;
  background: var(--color-bg-card);
  border-radius: 28px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-label {
  font-size: 0.7rem;
  font-weight: 850;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 0.4rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  background: var(--color-bg-main);
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-light);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-section label {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-text-secondary);
}

.form-input {
  padding: 0.9rem 1.15rem;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 1rem;
  color: var(--color-text-primary);
  background: var(--color-bg-main);
  transition: 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-color);
  background: var(--color-bg-card);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.textarea {
  height: 80px;
  resize: none;
}

.color-picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.15);
}

.custom-color-input {
  width: 32px;
  height: 32px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  padding: 0;
  cursor: pointer;
  background: none;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-tag {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.user-selector-container {
  border: 1.5px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-bg-card);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  font-size: 0.9rem;
  width: 100%;
  color: var(--color-text-primary);
}

.user-list {
  max-height: 380px;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.user-card-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.25rem 0.75rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.user-card-item:hover {
  background: var(--color-bg-card);
  border-color: color-mix(in srgb, var(--primary-color) 35%, transparent);
  transform: translateY(-2px);
}

.user-card-item.selected {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.uc-selected-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.uc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
  border: 2px solid var(--color-bg-card);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.uc-name {
  font-size: 0.85rem;
  font-weight: 750;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uc-email {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.uc-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: 100%;
}

.uc-name {
  font-size: 0.85rem;
  font-weight: 750;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uc-email {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-save {
  background: var(--color-text-primary);
  color: var(--color-bg-main);
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 750;
  cursor: pointer;
}

.btn-save:hover {
  background: var(--primary-color);
}

.btn-cancel {
  background: none;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-delete {
  color: #EF4444;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 750;
  cursor: pointer;
}

.teams-empty-state {
  text-align: center;
  padding: 6rem 2rem;
}

.empty-icon {
  margin-bottom: 2rem;
}

.teams-empty-state h2 {
  font-size: 1.5rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.teams-empty-state p {
  color: var(--color-text-muted);
  max-width: 400px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.btn-create-team-secondary {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.85rem 2rem;
  border-radius: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.btn-create-team-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.25s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
