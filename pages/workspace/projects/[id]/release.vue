<template>
  <div class="release-workspace-container">
    <div class="release-header-row">
      <div class="header-left">
        <h2>Releases & Artifacts</h2>
        <p>Manage versions, build logs, and deployment packages for this project.</p>
      </div>
      <div class="header-actions">
        <button class="btn-create-release" @click="openCreateModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Create New Release</span>
        </button>
      </div>
    </div>

    <div v-if="releases.length > 0" class="release-board">
      <div v-for="col in columns" :key="col.id" 
           class="release-column"
           :class="{ 'drop-over': dragOverColumnId === col.id }"
           @dragover.prevent="dragOverColumnId = col.id"
           @dragleave="dragOverColumnId = null"
           @drop="onDrop(col.id)">
        <div class="column-header">
          <div class="header-left-info">
             <span class="column-dot" :class="col.cls"></span>
             <h3 class="column-title">{{ col.name }}</h3>
             <span class="item-count">{{ getColumnReleases(col.id).length }}</span>
          </div>
        </div>
        
        <div class="column-body custom-scrollbar">
          <div v-for="rel in getColumnReleases(col.id)" :key="rel.id" 
               class="release-card" 
               draggable="true"
               @dragstart="onDragStart(rel.id)"
               @click="editRelease(rel)">
             <div class="rc-header">
                <span class="rc-tag">Version</span>
                <span class="rc-date">{{ formatDate(rel.createdAt) }}</span>
             </div>
             <h4 class="rc-title">{{ rel.name }}</h4>
             <p class="rc-desc">{{ rel.description || 'No description provided' }}</p>
             
             <div class="rc-footer">
                <div class="rc-sprints">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                   <span>{{ rel.sprintIds?.length || 0 }} Sprints Linked</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="release-placeholder-section">
      <div class="placeholder-card">
        <div class="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <h3>No Releases Yet</h3>
        <p>Create your first release to track project versions and deployments.</p>
        <button class="btn-create-first" @click="openCreateModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create First Release
        </button>
      </div>
    </div>

    <!-- Create/Edit Release Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container release-form-modal">
          <div class="modal-header">
             <div class="modal-title-group">
                <span class="modal-label">Release Management</span>
                <h2>{{ form.id ? 'Edit Release' : 'Configure New Release' }}</h2>
             </div>
             <button class="close-btn" @click="showModal = false">&times;</button>
          </div>
          
           <form @submit.prevent="saveRelease" class="modal-body">
              <div class="form-grid">
                 <div class="form-row">
                    <div class="form-section">
                       <label>Release Name</label>
                       <input v-model="form.name" type="text" class="form-input" placeholder="e.g., Q1 Milestone Release" required />
                    </div>

                    <div class="form-section">
                       <label>Status</label>
                       <select v-model="form.status" class="form-input">
                          <option v-for="c in columns" :key="c.id" :value="c.id">{{ c.name }}</option>
                       </select>
                    </div>
                 </div>

                  <div class="form-section">
                    <label>Select Sprints</label>
                    <div class="sprint-cards-grid">
                       <div v-for="s in filteredSprints" :key="s.id" class="sprint-card" :class="{ 'selected': form.sprintIds.includes(s.id) }" @click="toggleSprint(s.id)">
                          <div class="sprint-card-header">
                             <div class="check-circle">
                                <svg v-if="form.sprintIds.includes(s.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             </div>
                             <span class="sprint-card-badge" :class="s.status.toLowerCase().replace(' ', '-')">{{ s.status }}</span>
                          </div>
                          <span class="sprint-card-name">{{ s.name }}</span>
                          <span class="sprint-card-dates">{{ formatDateShort(s.startDate) }} - {{ formatDateShort(s.endDate) }}</span>
                       </div>
                       <div v-if="filteredSprints.length === 0" class="empty-select">
                         No sprints available to link.
                       </div>
                    </div>
                    <p class="hint">Linking sprints will tag all their items under this release.</p>
                 </div>

                <div class="form-section">
                   <label>Description</label>
                   <textarea v-model="form.description" class="form-input textarea" placeholder="What's included in this version?"></textarea>
                </div>
             </div>

              <div class="modal-footer">
                 <button v-if="form.id" type="button" class="btn btn-danger" @click="deleteRelease">Delete</button>
                 <div style="flex: 1"></div>
                 <button type="button" class="btn btn-secondary" @click="showModal = false">Discard</button>
                 <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Saving...' : (form.id ? 'Update Release' : 'Create Release') }}
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
const route = useRoute()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const releases = ref([])
const sprints = ref([])
const showModal = ref(false)
const saving = ref(false)
const draggedReleaseId = ref<number | null>(null)
const dragOverColumnId = ref<string | null>(null)

const columns = [
  { id: 'Planning', name: 'Planning', cls: 'planning' },
  { id: 'In Progress', name: 'In Progress', cls: 'inprogress' },
  { id: 'Deployed', name: 'Deployed', cls: 'deployed' }
]

const form = ref({
  id: null,
  name: '',
  status: 'Planning',
  description: '',
  sprintIds: [] as number[]
})

const fetchReleases = async () => {
  try {
    const data = await $fetch(`/api/releases?projectId=${route.params.id}`)
    releases.value = data as any[]
  } catch(e) { console.error(e) }
}

const fetchSprints = async () => {
  try {
    const data = await $fetch(`/api/sprints?projectId=${route.params.id}`)
    sprints.value = data as any[]
  } catch(e) { console.error(e) }
}

const filteredSprints = computed(() => sprints.value)

const getColumnReleases = (status: string) => {
  return releases.value.filter((r: any) => r.status === status)
}

const toggleSprint = (id: number) => {
  const idx = form.value.sprintIds.indexOf(id)
  if (idx === -1) form.value.sprintIds.push(id)
  else form.value.sprintIds.splice(idx, 1)
}

const openCreateModal = () => {
  form.value = { id: null, name: '', status: 'Planning', description: '', sprintIds: [] }
  showModal.value = true
}

const onDragStart = (id: number) => {
  draggedReleaseId.value = id
}

const { addToast } = useToast()

const onDrop = async (newStatus: string) => {
  if (!draggedReleaseId.value) return
  const id = draggedReleaseId.value
  draggedReleaseId.value = null
  dragOverColumnId.value = null
  
  // Optimistic update
  const relIdx = releases.value.findIndex((r: any) => r.id === id)
  const oldStatus = relIdx !== -1 ? releases.value[relIdx].status : ''
  if (relIdx !== -1) {
    releases.value[relIdx].status = newStatus
  }
  
  try {
    await $fetch(`/api/releases?id=${id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    addToast(`Release moved to ${newStatus}`, 'info')
  } catch(e) {
    addToast('Failed to update status', 'error')
    await fetchReleases()
  }
}

const editRelease = (rel: any) => {
  form.value = { ...rel, sprintIds: [...(rel.sprintIds || [])] }
  showModal.value = true
}

const saveRelease = async () => {
  saving.value = true
  try {
    const isEditing = !!form.value.id
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/releases?id=${form.value.id}` : '/api/releases'
    
    await $fetch(url, {
      method,
      body: {
        ...form.value,
        projectId: Number(route.params.id)
      }
    })
    
    addToast(isEditing ? 'Release Updated' : 'New Release Created', 'success')
    showModal.value = false
    await fetchReleases()
  } catch (e) {
    addToast('Failed to save release', 'error')
  } finally {
    saving.value = false
  }
}

const deleteRelease = async () => {
  if (!confirm('Are you sure you want to delete this release?')) return
  try {
    await $fetch(`/api/releases?id=${form.value.id}`, { method: 'DELETE' })
    addToast('Release Deleted Successfully', 'success')
    showModal.value = false
    await fetchReleases()
  } catch(e) {
    addToast('Failed to delete release', 'error')
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchReleases()
  fetchSprints()
})
</script>

<style scoped>
.release-workspace-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem;
  background: var(--color-bg-card);
  min-height: calc(100vh - 12rem);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.release-placeholder-section {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 16rem);
}

.placeholder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem;
  max-width: 420px;
}

.placeholder-icon {
  margin-bottom: 1.5rem;
}

.placeholder-icon svg {
  color: var(--primary-color);
  opacity: 0.8;
}

.placeholder-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.75rem;
}

.placeholder-card p {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.btn-create-first {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
}

.release-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin: 0 0 0.4rem 0;
  letter-spacing: -0.02em;
}

.header-left p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-create-release {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: 750;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-create-release:hover {
  filter: brightness(0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.release-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  flex: 1;
}

.release-column {
  background: var(--color-bg-main);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 22rem);
  min-height: 400px;
  padding: 1.25rem;
  border: 1px solid var(--color-border-light);
  transition: all 0.2s ease;
}

.release-column.drop-over {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
  transform: scale(1.01);
}

.column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.header-left-info { display: flex; align-items: center; gap: 0.75rem; }
.column-dot { width: 8px; height: 8px; border-radius: 50%; }
.column-dot.planning { background: #6366F1; }
.column-dot.inprogress { background: #F59E0B; }
.column-dot.deployed { background: var(--primary-color); }
.column-title { font-size: 0.9rem; font-weight: 800; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.05em; }
.item-count { background: rgba(0,0,0,0.05); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); }

.column-body { display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; padding-right: 0.5rem; }

.release-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.25rem;
  cursor: grab;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.release-card:active {
  cursor: grabbing;
}

.release-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
}

.rc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.rc-tag { font-size: 0.65rem; font-weight: 800; background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); padding: 0.25rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
.rc-date { font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600; }
.rc-title { font-size: 1rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.5rem; }
.rc-desc { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 1.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.rc-footer { border-top: 1px solid var(--color-border-light); padding-top: 1rem; }
.rc-sprints { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.75rem; font-weight: 700; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.release-form-modal { width: 900px; max-width: 95vw; background: var(--color-bg-card); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { padding: 1.75rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: flex-start; }
.modal-label { font-size: 0.65rem; font-weight: 800; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.4rem; }
.modal-header h2 { font-size: 1.25rem; font-weight: 850; color: var(--color-text-primary); margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; }

.form-grid { display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-section { display: flex; flex-direction: column; gap: 0.6rem; }
.form-section label { font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { padding: 0.85rem 1rem; border: 1.5px solid var(--color-border); border-radius: 12px; font-size: 0.95rem; background: var(--color-bg-main); transition: 0.2s; outline: none; }
.form-input:focus { border-color: var(--primary-color); background: var(--color-bg-card); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent); }
.textarea { height: 80px; resize: none; }

.sprint-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
.sprint-card { background: var(--color-bg-main); border: 1.5px solid var(--color-border); border-radius: 12px; padding: 0.75rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 0.4rem; }
.sprint-card:hover { border-color: var(--primary-color); transform: translateY(-2px); }
.sprint-card.selected { background: color-mix(in srgb, var(--primary-color) 8%, transparent); border-color: var(--primary-color); }
.sprint-card-header { display: flex; justify-content: space-between; align-items: center; }
.check-circle { width: 18px; height: 18px; border: 2px solid var(--color-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
.sprint-card.selected .check-circle { background: var(--primary-color); border-color: var(--primary-color); color: white; }
.sprint-card-badge { font-size: 0.6rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; text-transform: uppercase; }
.sprint-card-badge.completed { background: rgba(0,0,0,0.05); color: var(--color-text-muted); }
.sprint-card-badge.in-progress { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); }
.sprint-card-name { font-size: 0.8rem; font-weight: 700; color: var(--color-text-primary); }
.sprint-card-dates { font-size: 0.65rem; color: var(--color-text-muted); }

.modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--color-border-light); display: flex; gap: 1rem; align-items: center; }
</style>
