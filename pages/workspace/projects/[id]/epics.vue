<template>
  <div class="epics-workspace-container">
    <div class="epics-columns-layout">
      
      <!-- Left Sidebar: Epics List -->
      <aside class="epics-sidebar">
        <header class="sidebar-header">
           <div class="sidebar-header-row">
              <div class="search-bar-wrapper">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Search Epics..." 
                    class="sidebar-search-input"
                 />
              </div>
              <button class="btn-create-epic-small" title="Create New Epic" @click="openCreateModal">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
           </div>
        </header>

        <div class="sidebar-scrollable show-scrollbar">
           <div v-if="filteredEpics.length > 0" class="epics-list">
              <div 
                 v-for="epic in filteredEpics" 
                 :key="epic.id" 
                 class="epic-master-card"
                 :class="{ active: selectedEpicId === epic.id }"
                 @click="selectedEpicId = epic.id"
              >
                 <div class="epic-progress-circle">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                       <circle cx="20" cy="20" r="16" class="bg" />
                       <circle cx="20" cy="20" r="16" class="fg" :style="getProgressStyle(epic.id)" pathLength="100" />
                    </svg>
                    <span class="progress-text">{{ getEpicProgress(epic.id) }}%</span>
                 </div>
                 <div class="epic-card-info">
                    <h4 class="epic-title">{{ epic.title }}</h4>
                    <div class="epic-owner-info">
                       <img :src="getUserPhoto(epic.ownerId)" class="owner-avatar-mini" />
                       <span class="owner-name">{{ getUserName(epic.ownerId) }}</span>
                    </div>
                 </div>
                  <button class="epic-view-btn highlight" title="View Epic Details" @click.stop="viewEpicDetails(epic.id)">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
              </div>
           </div>
           <div v-else class="empty-list-state">
              <p>No epics found matching your search.</p>
           </div>
        </div>
      </aside>

      <!-- Main Content: Linked Items grouped by Sprint -->
      <main class="epics-content-area">
         <header v-if="selectedEpic" class="content-header">
            <div class="project-indicator">
               <span class="p-bullet"></span>
               <h2>{{ selectedEpic.title }}</h2>
            </div>
            <div class="header-stats">
               <span class="stat-pill">Total {{ epicLinkedItems.length }} Item(s) worth {{ totalEpicPoints }} points</span>
            </div>
         </header>

         <div class="items-scroll-pane">
            <div v-if="selectedEpic" class="grouped-items-container">
               <!-- Grouped Sections -->
               <div v-for="group in groupedItems" :key="group.id" class="epic-group-section">
                  <div class="group-header">
                     <span class="group-icon">
                        <svg v-if="group.type === 'sprint'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                     </span>
                     <h3 class="group-name">{{ group.name }}</h3>
                  </div>

                  <div class="group-tasks-list show-scrollbar">
                     <div v-for="item in group.items" :key="item.id" class="epic-task-card" @click="viewItem(item)">
                        <div class="task-card-accent" :class="item.type.toLowerCase()"></div>
                        <div class="task-card-main">
                           <div class="task-card-header">
                              <div class="task-uid-group">
                                 <!-- Type Icons -->
                                 <span class="type-icon-wrapper" :class="item.type.toLowerCase()">
                                    <!-- Story: 2 Papers stacked -->
                                    <svg v-if="item.type === 'Story'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 12h10M7 8h10M7 16h10M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                    <!-- Task: Circle with Tick -->
                                    <svg v-else-if="item.type === 'Task'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <!-- Bug: Beetle/Bug style -->
                                    <svg v-else-if="item.type === 'Bug'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="13" r="6"></circle><path d="M12 7V3M8 3l1.5 3M16 3l-1.5 3M12 19v2M5 11l-3-1M5 15l-3 1M19 11l3-1M19 15l3 1"></path><path d="M12 10v6"></path></svg>
                                 </span>
                                 <span class="task-uid">{{ item.uid }}</span>
                              </div>
                              <div class="task-card-meta-right">
                                 <img v-if="item.teamAllocations?.length > 0" :src="getUserPhoto(item.teamAllocations[0].userId)" class="task-user-avatar" title="Assigned User" />
                                 <span v-else class="unassigned-badge" title="No user assigned">UN</span>
                              </div>
                           </div>
                           <h5 class="task-title">{{ item.title }}</h5>
                           <div class="task-card-footer">
                              <div class="task-status-row">
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="color: var(--primary-color)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                 <span class="status-name">{{ item.status }}</span>
                              </div>
                              <div v-if="group.type === 'backlog' && item.sprintId" class="sprint-ref">
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                 <span>{{ getSprintName(item.sprintId) }}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div v-else class="select-epic-prompt">
               <div class="prompt-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
               </div>
               <p>Select an Epic to view linked items</p>
            </div>
         </div>
      </main>
    </div>

    <!-- Create/Edit Epic Modal -->
    <div v-if="showEpicModal" class="modal-overlay" @click.self="showEpicModal = false">
      <div class="modal-container epic-manage-modal">
        <div class="modal-header">
          <h2>{{ epicForm.id ? 'Edit Epic' : 'Create New Epic' }}</h2>
          <button class="close-btn" @click="showEpicModal = false">×</button>
        </div>
        <form @submit.prevent="saveEpic" class="modal-form-wrapper">
          <div class="scrollable-form-content">
            <div class="form-main-layout">
              <!-- Left: Details -->
              <div class="form-column-left">
                <div class="input-group">
                  <label>Epic Title</label>
                  <input type="text" v-model="epicForm.title" required placeholder="e.g. Mobile App Redesign" />
                </div>
                
                <div class="input-group">
                  <label>Epic Description</label>
                  <div class="rich-text-container">
                     <div class="rich-text-toolbar">
                        <button type="button" class="tool-btn" @click="formatText('bold')" title="Bold"><b>B</b></button>
                        <button type="button" class="tool-btn" @click="formatText('italic')" title="Italic"><i>I</i></button>
                        <button type="button" class="tool-btn" @click="formatText('bulletList')" title="List">•</button>
                        <span class="tool-label">Epic Editor</span>
                     </div>
                     <textarea v-model="epicForm.description" class="textarea-input rich-editor" placeholder="What are the high-level goals of this epic?"></textarea>
                  </div>
                </div>
              </div>

              <!-- Right: Metadata -->
              <div class="form-column-right">
                <div class="input-group">
                  <label>Epic Owner</label>
                  <select v-model="epicForm.ownerId" class="select-input" required>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div class="input-group">
                  <label>Start Date</label>
                  <input type="date" v-model="epicForm.startDate" required />
                </div>

                <div class="input-group">
                  <label>End Date</label>
                  <input type="date" v-model="epicForm.endDate" required />
                </div>

                <div class="input-group" v-if="epicForm.id">
                   <label>Status</label>
                   <select v-model="epicForm.status" class="select-input highlight">
                      <option value="Active">Active</option>
                      <option value="Archive">Archive</option>
                      <option value="Completed">Completed</option>
                   </select>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions sticky-footer">
            <button type="button" class="btn-cancel" @click="showEpicModal = false">Discard</button>
            <button type="submit" class="btn-save">{{ epicForm.id ? 'Save Changes' : 'Create Epic' }}</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Item Detail Slide Panel (Replicated from Board) -->
    <transition name="slide-panel">
      <div v-if="activeItem" class="item-panel-overlay" @click.self="activeItem = null">
        <div class="item-panel">
          <div class="ip-header">
            <div class="ip-header-left">
              <span class="ip-type-icon" :class="activeItem.type.toLowerCase()">
                <svg v-if="activeItem.type === 'Bug'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="13" r="6"></circle><path d="M12 7V3M8 3l1.5 3M16 3l-1.5 3"></path></svg>
                <svg v-else-if="activeItem.type === 'Story'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </span>
              <span class="ip-uid">{{ activeItem.uid }}</span>
            </div>
            <div class="ip-header-right">
              <button class="ip-open-btn" @click.stop="navigateToItem(activeItem.id)" title="Open full page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </button>
              <button class="ip-close-btn" @click="activeItem = null">&times;</button>
            </div>
          </div>

          <div class="ip-title-section">
            <h2 class="ip-title">{{ activeItem.title }}</h2>
          </div>

          <div class="ip-meta-grid">
            <div class="ip-meta-item">
              <span class="ip-meta-label">Status</span>
              <span class="ip-status-badge" :class="activeItem.status.toLowerCase().replace(' ', '-')">{{ activeItem.status }}</span>
            </div>
            <div class="ip-meta-item">
              <span class="ip-meta-label">Priority</span>
              <span class="ip-priority-badge" :class="activeItem.priority.toLowerCase()">{{ activeItem.priority }}</span>
            </div>
          </div>

          <div class="ip-section">
            <h4 class="ip-section-label">Description</h4>
            <div v-if="activeItem.description" class="ip-description" v-html="activeItem.description"></div>
            <div v-else class="ip-no-content">No description provided</div>
          </div>

          <div class="ip-section">
            <h4 class="ip-section-label">Assignees</h4>
            <div v-if="activeItem.teamAllocations && activeItem.teamAllocations.length > 0" class="ip-assignees">
              <div v-for="a in activeItem.teamAllocations" :key="a.userId" class="ip-assignee-chip">
                <img :src="getUserPhoto(a.userId)" class="ip-avatar" />
                <span>{{ getUserName(a.userId) }}</span>
              </div>
            </div>
            <div v-else class="ip-no-content">Unassigned</div>
          </div>

          <div class="ip-footer">
            <button class="ip-full-btn" @click.stop="navigateToItem(activeItem.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Open Full Details
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({ 
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { user: authUser } = useAuth()
const currentUserId = computed(() => authUser.value?.id || 1)
const activeItem = ref<any>(null)
const epics = ref<any[]>([])
const allItems = ref<any[]>([])
const sprints = ref<any[]>([])
const users = ref<any[]>([])
const searchQuery = ref('')
const selectedEpicId = ref<number | null>(null)
const showEpicModal = ref(false)

const epicForm = ref({
  id: null as number | null,
  title: '',
  description: '',
  ownerId: null as number | null,
  startDate: '',
  endDate: '',
  status: 'Active'
})

const openCreateModal = () => {
  epicForm.value = {
    id: null,
    title: '',
    description: '',
    ownerId: users.value[0]?.id || null,
    startDate: '',
    endDate: '',
    status: 'Active'
  }
  showEpicModal.value = true
}

const saveEpic = async () => {
  try {
    const isEdit = !!epicForm.value.id
    const method = isEdit ? 'PUT' : 'POST'
    const url = isEdit ? `/api/epics?id=${epicForm.value.id}` : '/api/epics'

    await $fetch(url, {
      method,
      body: {
        ...epicForm.value,
        projectId: Number(route.params.id)
      }
    })
    showEpicModal.value = false
    await fetchEpics()
  } catch (e) {
    alert('Failed to save epic')
  }
}

const formatText = (command: string) => {
  const textarea = document.querySelector('.rich-editor') as HTMLTextAreaElement
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = epicForm.value.description
  const selectedText = text.substring(start, end)
  let newText = ''
  if (command === 'bold') newText = `**${selectedText}**`
  else if (command === 'italic') newText = `*${selectedText}*`
  else if (command === 'bulletList') newText = `\n- ${selectedText}`
  epicForm.value.description = text.substring(0, start) + newText + text.substring(end)
}

const filteredEpics = computed(() => {
  if (!searchQuery.value) return epics.value
  const query = searchQuery.value.toLowerCase()
  return epics.value.filter(e => 
    e.title.toLowerCase().includes(query) || 
    getUserName(e.ownerId).toLowerCase().includes(query)
  )
})

const selectedEpic = computed(() => epics.value.find(e => e.id === selectedEpicId.value))

const epicLinkedItems = computed(() => {
  if (!selectedEpicId.value) return []
  return allItems.value.filter(item => item.epicId === selectedEpicId.value)
})

const totalEpicPoints = computed(() => {
  return epicLinkedItems.value.reduce((sum, item) => sum + (item.estimatedPoints || 0), 0)
})

const groupedItems = computed(() => {
  if (!selectedEpicId.value) return []
  
  const groups: any[] = []
  const items = epicLinkedItems.value

  // First: Backlog
  const backlogItems = items.filter(i => !i.sprintId)
  if (backlogItems.length > 0) {
    groups.push({
      id: 'backlog',
      name: 'Backlog',
      type: 'backlog',
      items: backlogItems
    })
  }

  // Then: Sprints in order
  sprints.value.forEach(sprint => {
    const sprintItems = items.filter(i => i.sprintId === sprint.id)
    if (sprintItems.length > 0) {
      groups.push({
        id: sprint.id,
        name: sprint.name,
        type: 'sprint',
        items: sprintItems
      })
    }
  })

  return groups
})

const fetchEpics = async () => {
  try {
    const data = await $fetch<any[]>(`/api/epics?projectId=${route.params.id}`)
    epics.value = data
    if (data.length > 0) selectedEpicId.value = data[0].id
  } catch (e) {
    console.error('Failed to fetch epics')
  }
}

const fetchItems = async () => {
  try {
    const data = await $fetch<any[]>(`/api/items?projectId=${route.params.id}`)
    allItems.value = data
  } catch (e) {
    console.error('Failed to fetch items')
  }
}

const fetchSprints = async () => {
  try {
    const data = await $fetch<any[]>(`/api/sprints?projectId=${route.params.id}`)
    sprints.value = data
  } catch (e) {
    console.error('Failed to fetch sprints')
  }
}

const fetchUsers = async () => {
  try {
    const data = await $fetch<any[]>('/api/users')
    users.value = data
  } catch (e) {
    console.error('Failed to fetch users')
  }
}

const viewEpicDetails = (epicId: number) => {
  const epic = epics.value.find(e => e.id === epicId)
  if (epic) {
    epicForm.value = { ...epic }
    showEpicModal.value = true
  }
}

const getUserName = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : 'Unknown'
}

const viewItem = (item: any) => {
  activeItem.value = item
}

const navigateToItem = (itemId: number) => {
  router.push(`/workspace/projects/${route.params.id}/items/${itemId}?from=board`)
}

// Timer Logic Replicated from Sprints
const timers = ref<Record<number, { status: 'running' | 'paused' | 'idle', seconds: number, lastStart: number | null }>>({})
const now = ref(Date.now())
let ticker: any = null

onMounted(() => {
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

const isAssignedToMe = (item: any) => {
  return item?.teamAllocations?.some(a => a.userId === currentUserId.value)
}

const getTimerStatus = (itemId: number) => timers.value[itemId]?.status || 'idle'

const formatTime = (itemId: number) => {
  const timer = timers.value[itemId] || { status: 'idle', seconds: 0, lastStart: null }
  let totalSeconds = timer.seconds
  if (timer.status === 'running' && timer.lastStart) {
    totalSeconds += Math.floor((now.value - timer.lastStart) / 1000)
  }
  
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const startTaskTimer = (itemId: number) => {
  if (!timers.value[itemId]) {
    timers.value[itemId] = { status: 'idle', seconds: 0, lastStart: null }
  }
  timers.value[itemId].status = 'running'
  timers.value[itemId].lastStart = Date.now()
}

const pauseTaskTimer = (itemId: number) => {
  const timer = timers.value[itemId]
  if (timer && timer.status === 'running' && timer.lastStart) {
    timer.seconds += Math.floor((Date.now() - timer.lastStart) / 1000)
    timer.status = 'paused'
    timer.lastStart = null
  }
}

const stopTaskTimer = (itemId: number) => {
  if (confirm('Stop timer and reset?')) {
    timers.value[itemId] = { status: 'idle', seconds: 0, lastStart: null }
  }
}

const getUserPhoto = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  if (user?.profile_photo) return user.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Unknown')}&background=10B981&color=fff&size=40`
}

const getSprintName = (sprintId: number) => {
  const sprint = sprints.value.find(s => s.id === sprintId)
  return sprint ? sprint.name : 'Backlog'
}

const getEpicProgress = (epicId: number) => {
  const items = allItems.value.filter(i => i.epicId === epicId)
  if (items.length === 0) return 0
  const completed = items.filter(i => i.status?.toLowerCase() === 'completed').length
  return Math.round((completed / items.length) * 100)
}

const getProgressStyle = (epicId: number) => {
  const progress = getEpicProgress(epicId)
  const offset = 100 - progress
  return {
    strokeDasharray: '100 100',
    strokeDashoffset: offset
  }
}

onMounted(() => {
  fetchEpics()
  fetchItems()
  fetchSprints()
  fetchUsers()
})
</script>

<style scoped>
.epics-workspace-container {
  padding: 0;
  margin: 0;
  width: 100%;
  min-height: calc(100vh - 80px);
  background: var(--color-bg-card);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  font-family: var(--font-family);
}

.epics-columns-layout {
  display: flex;
  height: 100%;
  min-height: calc(100vh - 80px);
  overflow: hidden;
}

/* Sidebar Styling */
.epics-sidebar {
  width: 320px;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 2px solid var(--color-border-light);
  border-radius: var(--radius-lg) 0 0 0;
}

.sidebar-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-bar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.btn-create-epic-small {
  background: var(--primary-color);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}
.btn-create-epic-small:hover {
  filter: brightness(0.9);
  transform: rotate(90deg);
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.sidebar-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--color-bg-main);
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
}

.sidebar-search-input:focus {
  background: var(--color-bg-card);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.sidebar-scrollable {
  flex: 1;
  overflow-y: scroll;
  padding: 1rem 0.5rem;
  border-radius: 0 0 0 var(--radius-lg);
  min-height: 0;
  scrollbar-width: always;
  -webkit-overflow-scrolling: touch;
}

.sidebar-scrollable::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
.sidebar-scrollable::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 6px;
}
.sidebar-scrollable::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 6px;
  border: 3px solid #e5e7eb;
}
.sidebar-scrollable::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.epic-master-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.epic-master-card:hover {
  background: var(--color-bg-main);
}

.epic-master-card.active {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border-color: color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.epic-progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.epic-progress-circle svg {
  transform: rotate(-90deg);
}

.epic-progress-circle circle {
  fill: none;
  stroke-width: 3;
}

.epic-progress-circle circle.bg {
  stroke: var(--color-border);
}

.epic-progress-circle circle.fg {
  stroke: var(--primary-color);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-text-secondary);
}

.epic-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
  flex: 1;
}

.epic-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.epic-owner-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.owner-avatar-mini {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.owner-name {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.epic-view-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.6;
}

.epic-view-btn.highlight:hover {
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  border-color: var(--primary-color);
  color: var(--primary-color);
  opacity: 1;
}

.epic-master-card:hover .epic-view-btn,
.epic-master-card.active .epic-view-btn {
  opacity: 1;
}


.epic-view-btn:hover {
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: scale(1.1);
}

/* Modal Styling Reused from Backlog */
.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; 
}

.modal-container.epic-manage-modal { 
  background: var(--color-bg-card); width: 100%; max-width: 1000px; 
  border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
  height: min-content; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { transform: scale(0.95) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; background: var(--color-bg-card); }
.modal-header h2 { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
.close-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--color-border-light); border: none; cursor: pointer; color: var(--color-text-muted); }

.scrollable-form-content { padding: 2rem; overflow-y: auto; }
.form-main-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
.form-column-left, .form-column-right { display: flex; flex-direction: column; gap: 1.5rem; }

.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; }
.input-group input, .input-group select, .input-group textarea { padding: 0.75rem; border: 1.5px solid var(--color-border); border-radius: 10px; font-size: 0.95rem; outline: none; background: var(--color-bg-main); color: var(--color-text-primary); }
.input-group input:focus { border-color: var(--primary-color); }

.rich-text-container { border: 1.5px solid var(--color-border); border-radius: 12px; overflow: hidden; background: var(--color-bg-main); }
.rich-text-toolbar { background: var(--color-bg-main); padding: 0.5rem; border-bottom: 1px solid var(--color-border); display: flex; gap: 0.5rem; align-items: center; }
.tool-btn { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer; color: var(--color-text-primary); }
.tool-label { margin-left: auto; font-size: 0.65rem; color: var(--color-text-muted); font-weight: 800; }
.rich-editor { border: none !important; min-height: 200px; width: 100%; border-radius: 0 !important; background: transparent; color: var(--color-text-primary); }

.modal-actions { padding: 1.5rem 2rem; border-top: 1px solid var(--color-border-light); display: flex; justify-content: flex-end; gap: 1rem; background: var(--color-bg-card); }
.btn-save { background: var(--primary-color); color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: var(--color-bg-main); border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

/* Main Content Area Styling */
.epics-content-area {
  flex: 1;
  background: var(--color-bg-main);
  display: flex;
  flex-direction: column;
}

.content-header {
  padding: 2rem 3rem;
  background: var(--color-bg-card);
  border-bottom: 2px solid var(--color-border-light);
  border-radius: 0 var(--radius-lg) 0 0;
}

.project-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.p-bullet {
  width: 8px;
  height: 8px;
  background: var(--color-bg-main);
  border: 2px solid var(--primary-color);
  border-radius: 50%;
}

.content-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-pill {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.items-scroll-pane {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2rem;
  background: var(--color-bg-main);
}

.grouped-items-container {
  display: flex;
  gap: 2rem;
  height: 100%;
  align-items: flex-start;
}

.epic-group-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 350px;
  max-width: 350px;
  height: calc(100% - 0px);
  background: var(--color-bg-card);
  padding: 1rem;
  border-radius: 20px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: transparent;
  border-radius: 0;
  border: none;
  align-self: flex-start;
  box-shadow: none;
}

.group-icon {
  width: 22px;
  height: 22px;
  background: var(--color-bg-main);
  color: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.group-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: scroll;
  flex: 1;
  padding-right: 0.25rem;
  min-height: 0;
  scrollbar-width: always;
  -webkit-overflow-scrolling: touch;
}

/* Webkit (Chrome, Safari, Edge) */
.group-tasks-list::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
.group-tasks-list::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 6px;
}
.group-tasks-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 6px;
  border: 3px solid #e5e7eb;
}
.group-tasks-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.epic-task-card {
  background: var(--color-bg-main);
  border: 1.5px solid transparent;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.epic-task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border-color: var(--primary-color);
  cursor: pointer;
}

/* ─── Item Detail Slide Panel (Replicated from Board) ───────────────── */
.item-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
  z-index: 500;
}

.item-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 480px;
  background: var(--color-bg-card);
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0,0,0,0.12);
  animation: slidePanelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slidePanelIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.ip-header { padding: 1.5rem 1.75rem; border-bottom: 2px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; }
.ip-header-left { display: flex; align-items: center; gap: 0.75rem; }
.ip-type-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.ip-type-icon.story { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.ip-type-icon.task { background: #EFF6FF; color: #3B82F6; }
.ip-type-icon.bug { background: #FEF2F2; color: #EF4444; }
.ip-uid { font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--color-text-muted); }

.ip-header-right { display: flex; align-items: center; gap: 0.5rem; }
.ip-open-btn, .ip-close-btn { background: var(--color-bg-main); border: none; width: 32px; height: 32px; border-radius: 8px; color: var(--color-text-muted); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.ip-open-btn:hover { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); }

/* Title Section */
.ip-title-section { padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--color-border-light); }
.ip-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); line-height: 1.4; }

/* Meta Grid */
.ip-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--color-border-light); }
.ip-meta-item { display: flex; flex-direction: column; gap: 0.35rem; }
.ip-meta-label { font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.ip-status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.ip-status-badge.active { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.ip-status-badge.completed { background: #F0FDF4; color: #10B981; }
.ip-status-badge.in-progress { background: #EFF6FF; color: #3B82F6; }
.ip-status-badge.backlog { background: var(--color-bg-main); color: var(--color-text-muted); }
.ip-priority-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.ip-priority-badge.high { background: #FEF2F2; color: #EF4444; }
.ip-priority-badge.medium { background: #FEF3C7; color: #F59E0B; }
.ip-priority-badge.low { background: #EFF6FF; color: #3B82F6; }

/* Sections */
.ip-section { padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--color-border-light); }
.ip-section-label { font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem; }
.ip-description { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; }
.ip-description p { margin: 0 0 0.5rem; }
.ip-no-content { font-size: 0.85rem; color: var(--color-text-muted); font-style: italic; }

/* Assignees */
.ip-assignees { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ip-assignee-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem 0.35rem 0.35rem; background: var(--color-bg-main); border-radius: 20px; }
.ip-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.ip-assignee-chip span { font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); }

/* Footer */
.ip-footer { padding: 1.25rem 1.75rem; margin-top: auto; }
.ip-full-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.9rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.ip-full-btn:hover { filter: brightness(0.9); transform: translateY(-1px); }

.ip-full-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.9rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.ip-full-btn:hover { filter: brightness(0.9); transform: translateY(-1px); }

/* Slide panel transition */
.slide-panel-enter-active, .slide-panel-leave-active { transition: all 0.3s ease; }
.slide-panel-enter-from .item-panel, .slide-panel-leave-to .item-panel { transform: translateX(100%); }
.slide-panel-enter-from, .slide-panel-leave-to { opacity: 0; }

.task-card-accent {
  width: 4px;
}
.task-card-accent.story { background: var(--primary-color); }
.task-card-accent.task { background: var(--color-info); }
.task-card-accent.bug { background: var(--color-danger); }

.task-card-main {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-uid-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.type-icon-wrapper.story { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.type-icon-wrapper.task { background: #EFF6FF; color: #3B82F6; }
.type-icon-wrapper.bug { background: #FEF2F2; color: #EF4444; }

.task-uid {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.unassigned-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-text-muted);
  background: var(--color-bg-main);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.task-user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.task-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.task-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.task-status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.sprint-ref {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-main);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.select-epic-prompt {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  color: var(--color-text-muted);
}

.prompt-icon {
  background: var(--color-bg-main);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  color: var(--color-text-muted);
}
</style>
