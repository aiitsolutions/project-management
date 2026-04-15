<template>
  <div class="studio-container">
    <!-- Breadcrumb removed, handled by parent [id].vue -->

    <div class="studio-native-content">
      
      <header class="studio-view-header">
         <div class="studio-titles">
            <div class="title-row">
               <input v-if="isEditing" v-model="editForm.title" class="title-input" placeholder="Enter title..." />
               <h1 v-else>{{ item?.title || 'Loading...' }}</h1>
            </div>
            <p v-if="item && !isEditing">{{ item.type }} • {{ item.priority }} Priority</p>
         </div>
         <div class="header-buttons">
            <button class="btn-secondary-thematic" @click="deleteItem">Delete</button>
            <button class="btn-primary-thematic" @click="toggleEdit">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
               {{ isEditing ? 'Cancel' : 'Edit' }}
            </button>
         </div>
      </header>

      <div v-if="loading" class="loading-state">Loading...</div>

      <div v-else-if="item" class="item-detail-content">
        
        <div class="detail-grid">
          <div class="detail-main">
            
            <!-- Description -->
            <div class="detail-section">
              <h3>Description</h3>
              <div v-if="!isEditing" class="description-view">
                <p v-if="item.description" v-html="item.description"></p>
                <p v-else class="no-content">No description provided</p>
              </div>
              <div v-else class="editor-thematic">
                <RichTextEditor v-model="editForm.description" />
              </div>
            </div>

            <!-- Team -->
            <div v-if="canAssignUsers" class="detail-section">
              <h3>Team Members</h3>
              <div v-if="!isEditing" class="team-view">
                <div v-if="item.teamAllocations && item.teamAllocations.length > 0" class="team-list-cards">
                  <div v-for="allocation in item.teamAllocations" :key="allocation.userId" class="member-card-presentation">
                    <div class="card-p-header">
                      <div class="p-avatar-wrap">
                        <img :src="getUserPhoto(allocation.userId)" class="p-avatar" />
                      </div>
                      <div class="p-user-meta">
                        <span class="p-name">{{ getUserName(allocation.userId) }}</span>
                        <span class="p-dept">Engineer</span>
                      </div>
                    </div>
                    <div class="card-p-stats">
                      <div class="p-stat">
                        <span class="p-stat-label">Allocation</span>
                        <span class="p-stat-val">{{ allocation.estimatedHours || 0 }} hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="no-content">No team members assigned</p>
              </div>
              <div v-else class="team-grid-edit">
                <div v-for="user in users" :key="user.id" class="edit-member-card" :class="{ selected: isUserSelected(user.id) }" @click="toggleUser(user.id)">
                  <div class="card-selection-indicator">✓</div>
                  <div class="emc-header">
                    <img :src="user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff&size=40`" class="emc-avatar" />
                    <div class="emc-info">
                       <span class="emc-name">{{ user.name }}</span>
                       <span class="emc-dept">Engineering</span>
                    </div>
                  </div>
                  
                  <div v-if="isUserSelected(user.id)" class="emc-hours-wrap" @click.stop>
                    <label>Assigned Hours</label>
                    <div class="emc-input-row">
                      <input 
                        type="number" 
                        :value="getUserEstimatedHours(user.id)" 
                        @input="setUserEstimatedHours(user.id, $event)"
                        placeholder="0"
                        class="emc-mini-input"
                      />
                      <span class="emc-unit">HRS</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <!-- Time Logs -->
          <div class="detail-section">
            <div class="tl-header">
              <div class="tl-title-group">
                 <h3>Time Logs</h3>
                 <div class="tl-total">{{ formatHoursToHHMM(totalLoggedHours) }}</div>
              </div>
              <button v-if="isAssignedToMe" class="btn-primary-thematic btn-sm" style="padding: 0.4rem 1rem; font-size: 0.8rem;" @click="openLogModal()">+ Log Time</button>
            </div>
            
            <div v-if="item.timeLogs && item.timeLogs.length > 0" class="tl-list">
              <div v-for="log in item.timeLogs" :key="log.id" class="tl-entry">
                <img :src="getUserPhoto(log.userId)" class="tl-avatar" />
                <div class="tl-details">
                  <div class="tl-user-row">
                    <span class="tl-name">{{ getUserName(log.userId) }}</span>
                    <span class="tl-date">For: {{ formatDateShort(log.date) }}</span>
                  </div>
                  <div class="tl-desc" v-if="log.description">{{ log.description }}</div>
                  <div class="tl-meta">Added: {{ formatDateShort(log.createdAt) }}</div>
                </div>
                <div class="tl-hours-actions">
                  <span class="tl-hours">{{ formatHoursToHHMM(log.hours) }}</span>
                  <div class="tl-actions">
                    <button class="tl-action-btn edit" @click="editLog(log)" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="tl-action-btn delete" @click="deleteLog(log.id)" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-content">No time logged yet.</div>
          </div>

          <!-- Sub Items Section -->
          <div class="detail-section">
            <div class="section-header">
              <h3>Sub Items</h3>
              <div class="sub-item-actions">
                <button class="btn-secondary-thematic btn-sm" style="padding: 0.4rem 1rem; font-size: 0.8rem;" @click="showSubItemModal = true">+ Add New</button>
                <button class="btn-primary-thematic btn-sm" style="padding: 0.4rem 1rem; font-size: 0.8rem;" @click="openAssociateModal()">+ Associate</button>
              </div>
            </div>
            
            <div v-if="subItems.length > 0" class="sub-items-list">
              <div v-for="sub in subItems" :key="sub.id" class="sub-item-row" @click="navigateToSubItem(sub.id)">
                <div class="si-type-badge" :class="sub.type?.toLowerCase()">{{ sub.type }}</div>
                <div class="si-info">
                  <span class="si-uid">{{ sub.uid }}</span>
                  <span class="si-title">{{ sub.title }}</span>
                </div>
                <span class="si-status" :class="sub.status?.toLowerCase().replace(' ', '-')">{{ sub.status }}</span>
              </div>
            </div>
            <div v-else class="no-content">No sub items yet.</div>
          </div>

        </div>

          <div class="detail-sidebar">
            
            <!-- Task ID -->
            <div class="sidebar-card">
              <h4>Task ID</h4>
              <div class="task-id-row">
                 <div class="task-id-display">{{ item.uid }}</div>
                 <button class="btn-copy-id" @click="copyId" :title="copied ? 'Copied!' : 'Copy ID'">
                    <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                     <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </button>
              </div>
            </div>

              <!-- Status -->
            <div class="sidebar-card">
              <h4>Status</h4>
              <div v-if="!isEditing" class="status-display">{{ item.status }}</div>
              <select v-else v-model="editForm.status" class="edit-select">
                <option :value="item.status">{{ item.status }}</option>
                <option v-for="status in workspaceStatuses" :key="status.id" :value="status.name">{{ status.name }}</option>
              </select>
            </div>

            <!-- Type -->
            <div class="sidebar-card">
              <h4>Type</h4>
              <div v-if="!isEditing" class="type-display">{{ item.type }}</div>
              <select v-else v-model="editForm.type" class="edit-select">
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="sidebar-card">
              <h4>Priority</h4>
              <div v-if="!isEditing" class="priority-display" :class="item.priority.toLowerCase()">{{ item.priority }}</div>
              <select v-else v-model="editForm.priority" class="edit-select">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <!-- Dates -->
            <div class="sidebar-card">
              <h4>Timeline</h4>
              <div class="date-info">
                <div class="date-row">
                  <span class="date-label">Start:</span>
                  <span v-if="!isEditing">{{ item.startDate || 'Not set' }}</span>
                  <input v-else type="date" v-model="editForm.startDate" class="edit-input" />
                </div>
                <div class="date-row">
                  <span class="date-label">End:</span>
                  <span v-if="!isEditing">{{ item.endDate || 'Not set' }}</span>
                  <input v-else type="date" v-model="editForm.endDate" class="edit-input" />
                </div>
              </div>
            </div>

            <!-- Sprint -->
            <div class="sidebar-card">
              <h4>Sprint</h4>
              <div v-if="!isEditing" class="sprint-display">
                <span v-if="item.sprintId" class="sprint-pill-active">{{ getSprintName(item.sprintId) }}</span>
                <span v-else class="sprint-pill-backlog">Backlog</span>
              </div>
              <select v-else v-model="editForm.sprintId" class="edit-select">
                <option :value="null">Backlog</option>
                <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
                  {{ sprint.name }}
                </option>
              </select>
            </div>

            <!-- Total Effort (Stories Only) -->
            <div v-if="item.type === 'Story' && canShowEstimatedPoints" class="sidebar-card">
              <h4>Estimated Points</h4>
              <div v-if="!isEditing" class="effort-val-display">{{ item.estimatedPoints || 0 }} Pts</div>
              <select v-else v-model="editForm.estimatedPoints" class="edit-select">
                 <option :value="null">Unestimated</option>
                 <option v-for="p in [1, 2, 3, 5, 13, 21, 34, 55, 89]" :key="p" :value="p">{{ p }} Points</option>
              </select>
            </div>

            <!-- Estimated Hours -->
            <div class="sidebar-card">
              <h4>Estimated Hours</h4>
              <div class="hours-display-block">
                <div class="total-hours-container" :class="{ 'auto-calc': item.teamAllocations?.length > 0 }">
                   <span class="hours-val">{{ formatHoursToHHMM(calcTotalHours) }}</span>
                   <span class="hours-label">Total Est. Hours</span>
                </div>
              </div>
            </div>

            <!-- Meta -->
            <div class="sidebar-card meta-card">
              <h4>Details</h4>
              <div class="meta-row">
                <span>Created:</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="meta-row">
                <span>Updated:</span>
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Save Button -->
        <div v-if="isEditing" class="edit-actions">
          <button class="btn-secondary-thematic" @click="cancelEdit">Cancel</button>
          <button class="btn-primary-thematic" @click="saveItem">Save Changes</button>
        </div>

      </div>
    </div>

    <!-- Time Log Modal -->
    <div v-if="timeLogModalVisible" class="tl-modal-overlay" @click.self="cancelLogEdit">
      <div class="tl-modal">
        <div class="tl-modal-header">
          <h3>{{ editingLogId ? 'Update Time Log' : 'Add Time Log' }}</h3>
          <button class="close-btn" @click="cancelLogEdit">×</button>
        </div>
        <div class="tl-modal-body">
          <div class="form-group">
            <label>Team Member</label>
            <select v-model="manualLogUserId" class="tl-modal-input">
              <option v-for="a in item.teamAllocations" :key="a.userId" :value="a.userId">
                {{ getUserName(a.userId) }}
              </option>
            </select>
          </div>
          <div class="form-group-row">
            <div class="form-group" style="flex:1;">
              <label>Date</label>
              <input type="date" v-model="manualLogDate" class="tl-modal-input" />
            </div>
            <div class="form-group" style="flex:1;">
              <label>Duration (HH:MM)</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="number" v-model="manualLogH" placeholder="HH" class="tl-modal-input" style="padding: 0.75rem 0.5rem;" min="0" />
                <span style="font-weight: 800; color: var(--color-text-primary);">:</span>
                <input type="number" v-model="manualLogM" placeholder="MM" class="tl-modal-input" style="padding: 0.75rem 0.5rem;" min="0" max="59" />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea v-model="manualLogDesc" placeholder="What did you work on?" class="tl-modal-input tl-textarea"></textarea>
          </div>
        </div>
        <div class="tl-modal-footer">
          <button class="btn-secondary-thematic" @click="cancelLogEdit">Cancel</button>
          <button class="btn-primary-thematic" @click="addManualLog" :disabled="(!manualLogH && !manualLogM) || (Number(manualLogH) === 0 && Number(manualLogM) === 0)">
            {{ editingLogId ? 'Update Entry' : 'Save Entry' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Time Log Delete Modal -->
    <div v-if="deletingLogId !== null" class="tl-modal-overlay" @click.self="deletingLogId = null">
      <div class="tl-modal" style="max-width: 350px;">
        <div class="tl-modal-header" style="border-bottom: none; padding-bottom: 0;">
           <h3 style="color: var(--color-danger);">Delete Time Log</h3>
          <button class="close-btn" @click="deletingLogId = null">×</button>
        </div>
        <div class="tl-modal-body" style="padding-top: 0.5rem; gap: 1rem;">
          <p style="margin: 0; font-size: 0.9rem; color: #4B5563; line-height: 1.5;">Are you sure you want to delete this time entry? This action cannot be undone.</p>
        </div>
        <div class="tl-modal-footer" style="padding-top: 1rem;">
          <button class="btn-secondary-thematic" @click="deletingLogId = null">Cancel</button>
          <button class="btn-danger-thematic" @click="confirmDeleteLog">Yes, Delete</button>
        </div>
      </div>
    </div>

    <!-- Add Sub Item Modal - Using CreateItemModal Component -->
    <CreateItemModal 
      :is-open="showSubItemModal" 
      initial-target="Backlog"
      :parent-id="item?.id"
      :project-id="Number(route.params.id)"
      @close="showSubItemModal = false"
      @submit="handleSubItemCreated"
    />

    <!-- Associate Sub Items Modal -->
    <div v-if="showAssociateModal" class="modal-overlay" @click.self="showAssociateModal = false">
      <div class="modal-container" style="max-width: 70%; width: 70%;">
        <div class="modal-header">
          <h2>Associate Sub Items</h2>
          <button class="close-btn" @click="showAssociateModal = false">×</button>
        </div>
        <div class="modal-body-search">
          <input 
            v-model="associateSearch" 
            type="text" 
            class="search-input" 
            placeholder="Search items by title or ID..."
          />
        </div>
        <div class="associate-items-list">
          <div 
            v-for="item in filteredAvailableItems" 
            :key="item.id" 
            class="associate-item-row"
            :class="{ selected: isItemSelected(item.id) }"
            @click="toggleItemSelection(item.id)"
          >
            <div class="checkbox-col">
              <div class="checkbox-indicator">
                <svg v-if="isItemSelected(item.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
            <div class="item-type-badge" :class="item.type?.toLowerCase()">{{ item.type }}</div>
            <div class="item-info">
              <span class="item-uid">{{ item.uid }}</span>
              <span class="item-title">{{ item.title }}</span>
            </div>
            <span class="item-status" :class="item.status?.toLowerCase().replace(' ', '-')">{{ item.status }}</span>
          </div>
        </div>
        <div class="modal-footer-simple">
          <button class="btn-secondary-thematic" @click="showAssociateModal = false">Cancel</button>
          <button class="btn-primary-thematic" @click="saveAssociatedItems">Save Association</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
const route = useRoute()
const router = useRouter()
const itemTitle = inject<Ref<string>>('itemTitle')

const originPath = computed(() => {
  const from = route.query.from
  if (from === 'board') return '/sprints'
  if (from === 'item') return '/backlog'
  return '/backlog'
})

const originName = computed(() => {
  const from = route.query.from
  if (from === 'board') return 'Board'
  if (from === 'item') return 'Backlog'
  return 'Backlog'
})

const item = ref<any>(null)
const project = ref<any>(null)
const users = ref<any[]>([])
const sprints = ref<any[]>([])
const subItems = ref<any[]>([])
const workspaceStatuses = ref<any[]>([])
const itemTypeSettings = ref<any>({
  Story: { allowUserAssignment: true },
  Task: { allowUserAssignment: true },
  Bug: { allowUserAssignment: true }
})
const loading = ref(true)
const isEditing = ref(false)
const copied = ref(false)
const showSubItemModal = ref(false)
const showAssociateModal = ref(false)
const associateSearch = ref('')
const selectedItemIds = ref<number[]>([])

const openSubItemModal = () => {
  showSubItemModal.value = true
}

const handleSubItemCreated = async () => {
  showSubItemModal.value = false
  await fetchSubItems()
}

const availableItems = computed(() => {
  if (!item.value) return []
  
  const currentSprintId = item.value.sprintId
  
  return allItems.value.filter(i => {
    if (i.id === item.value.id) return false
    if (i.parentId) return false
    
    if (currentSprintId) {
      return i.sprintId === currentSprintId
    } else {
      return !i.sprintId
    }
  })
})

const filteredAvailableItems = computed(() => {
  const search = associateSearch.value.toLowerCase()
  if (!search) return availableItems.value
  return availableItems.value.filter(i => 
    i.uid?.toLowerCase().includes(search) || 
    i.title?.toLowerCase().includes(search)
  )
})

const isItemSelected = (id: number) => selectedItemIds.value.includes(id)

const toggleItemSelection = (id: number) => {
  const idx = selectedItemIds.value.indexOf(id)
  if (idx === -1) {
    selectedItemIds.value.push(id)
  } else {
    selectedItemIds.value.splice(idx, 1)
  }
}

const saveAssociatedItems = async () => {
  try {
    for (const id of selectedItemIds.value) {
      await $fetch(`/api/items?id=${id}`, {
        method: 'PUT',
        body: { parentId: item.value.id }
      })
    }
    addToast('Sub items associated successfully', 'success')
    showAssociateModal.value = false
    associateSearch.value = ''
    selectedItemIds.value = []
    await fetchSubItems()
  } catch (e) {
    addToast('Failed to associate items', 'error')
  }
}

const openAssociateModal = async () => {
  console.log('Opening associate modal, allItems:', allItems.value.length)
  if (allItems.value.length === 0) {
    await fetchSubItems()
  }
  selectedItemIds.value = []
  associateSearch.value = ''
  showAssociateModal.value = true
  console.log('showAssociateModal:', showAssociateModal.value)
}

const editForm = ref({
  title: '',
  description: '',
  type: 'Task',
  priority: 'Medium',
  status: 'Backlog',
  startDate: '',
  endDate: '',
  sprintId: null as number | null,
  parentId: null as number | null,
  teamAllocations: [] as { userId: number; effort: number; estimatedHours: number }[],
  estimatedPoints: null as number | null
})

const allItems = ref<any[]>([])
const potentialParents = computed(() => {
  if (!item.value) return []
  return allItems.value.filter(i => i.id !== item.value.id && !i.parentId)
})

const calcTotalHours = computed(() => {
  if (isEditing.value) {
    return editForm.value.teamAllocations.reduce((acc, a) => acc + (a.estimatedHours || 0), 0)
  }
  return item.value?.teamAllocations?.reduce((acc: number, a: any) => acc + (a.estimatedHours || 0), 0) || 0
})

const currentUserId = 1
const timeLogModalVisible = ref(false)
const manualLogUserId = ref(currentUserId)
const manualLogH = ref<number | ''>('')
const manualLogM = ref<number | ''>('')
const manualLogDate = ref(new Date().toISOString().split('T')[0])
const manualLogDesc = ref('')
const editingLogId = ref<number | null>(null)
const deletingLogId = ref<number | null>(null)

const openLogModal = () => {
    editingLogId.value = null
    manualLogH.value = ''
    manualLogM.value = ''
    manualLogDesc.value = ''
    manualLogDate.value = new Date().toISOString().split('T')[0]
    manualLogUserId.value = currentUserId
    timeLogModalVisible.value = true
}

const totalLoggedHours = computed(() => {
  if (!item.value?.timeLogs) return '0.00'
  return item.value.timeLogs.reduce((acc: number, log: any) => acc + Number(log.hours), 0).toFixed(2)
})

const isAssignedToMe = computed(() => {
  if (!item.value) return false
  return item.value.teamAllocations?.some((a: any) => a.userId === currentUserId)
})

const cancelLogEdit = () => {
    timeLogModalVisible.value = false
    editingLogId.value = null
    manualLogH.value = ''
    manualLogM.value = ''
    manualLogDesc.value = ''
    manualLogDate.value = new Date().toISOString().split('T')[0]
    manualLogUserId.value = currentUserId
}

const editLog = (log: any) => {
    editingLogId.value = log.id
    manualLogUserId.value = log.userId
    
    const hNum = Number(log.hours)
    manualLogH.value = Math.floor(hNum)
    manualLogM.value = Math.round((hNum - Math.floor(hNum)) * 60)
    
    manualLogDesc.value = log.description || ''
    manualLogDate.value = log.date
    timeLogModalVisible.value = true
}

const deleteLog = (logId: number) => {
  deletingLogId.value = logId
}

const confirmDeleteLog = async () => {
  if (deletingLogId.value !== null && item.value) {
    const oldLogs = [...item.value.timeLogs]
    item.value.timeLogs = item.value.timeLogs.filter((l: any) => l.id !== deletingLogId.value)
    try {
      await $fetch(`/api/items?id=${item.value.id}`, { method: 'PUT', body: { timeLogs: item.value.timeLogs } })
      addToast('Time log removed', 'info')
    } catch(e) {
      item.value.timeLogs = oldLogs
      addToast('Failed to remove log', 'error')
    }
    deletingLogId.value = null
  }
}

const addManualLog = async () => {
  if (!item.value) return
  
  const h = Number(manualLogH.value) || 0
  const m = Number(manualLogM.value) || 0
  const hours = Number((h + (m / 60)).toFixed(2))
  
  if (hours <= 0) {
    addToast('Enter a valid time duration', 'warning')
    return
  }
  
  if (!item.value.timeLogs) item.value.timeLogs = []
  
  const oldLogs = [...item.value.timeLogs]
  if (editingLogId.value) {
    const idx = item.value.timeLogs.findIndex((l: any) => l.id === editingLogId.value)
    if (idx !== -1) {
      item.value.timeLogs[idx].userId = manualLogUserId.value
      item.value.timeLogs[idx].hours = hours
      item.value.timeLogs[idx].description = manualLogDesc.value
      item.value.timeLogs[idx].date = manualLogDate.value
    }
  } else {
    item.value.timeLogs.push({
      id: Date.now(),
      userId: manualLogUserId.value,
      hours: hours,
      description: manualLogDesc.value,
      date: manualLogDate.value
    })
  }

  try {
    await $fetch(`/api/items?id=${item.value.id}`, { method: 'PUT', body: { timeLogs: item.value.timeLogs } })
    addToast(editingLogId.value ? 'Time log updated' : 'Time logged successfully', 'success')
    timeLogModalVisible.value = false
    editingLogId.value = null
    manualLogH.value = ''
    manualLogM.value = ''
    manualLogDesc.value = ''
  } catch(e) {
    item.value.timeLogs = oldLogs
    addToast('Failed to save time log', 'error')
  }
}

const fetchItem = async () => {
  try {
    const data = await $fetch<any>(`/api/items?id=${route.params.itemId}`)
    item.value = data
    if (itemTitle) itemTitle.value = data.title
    initEditForm()
    await fetchSubItems()
  } catch (e) {
    console.error('Failed to fetch item')
  } finally {
    loading.value = false
  }
}

const fetchSubItems = async () => {
  try {
    const data = await $fetch<any[]>(`/api/items?projectId=${route.params.id}`)
    allItems.value = data
    subItems.value = data.filter((i: any) => i.parentId === item.value?.id)
  } catch (e) {
    console.error('Failed to fetch sub items')
  }
}

const navigateToSubItem = (subItemId: number) => {
  router.push(`/workspace/projects/${route.params.id}/items/${subItemId}?from=item`)
}

const fetchUsers = async () => {
  try {
    const data = await $fetch<any[]>('/api/users')
    users.value = data.filter(u => u.is_active !== false)
  } catch (e) {
    console.error('Failed to fetch users')
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

const initEditForm = () => {
  if (item.value) {
    editForm.value = {
      title: item.value.title || '',
      description: item.value.description || '',
      type: item.value.type || 'Task',
      priority: item.value.priority || 'Medium',
      status: item.value.status || 'Backlog',
      startDate: item.value.startDate || '',
      endDate: item.value.endDate || '',
      sprintId: item.value.sprintId || null,
      parentId: item.value.parentId || null,
      teamAllocations: item.value.teamAllocations?.map((a: any) => ({ 
        userId: a.userId, 
        effort: a.effort || 1, 
        estimatedHours: a.estimatedHours || 0 
      })) || [],
      estimatedPoints: item.value.estimatedPoints || null
    }
  }
}

const getSprintName = (sprintId: number | null) => {
  if (!sprintId) return 'Backlog'
  const sprint = sprints.value.find(s => s.id === sprintId)
  return sprint ? sprint.name : 'Unknown Sprint'
}

const getParentName = (parentId: number | null) => {
  if (!parentId) return 'No Parent'
  const parent = allItems.value.find(i => i.id === parentId)
  return parent ? `${parent.uid} - ${parent.title}` : 'Unknown'
}

const viewParentItem = (parentId: number) => {
  router.push(`/workspace/projects/${route.params.id}/items/${parentId}?from=item`)
}

const getUserName = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : 'Unknown'
}

const getUserPhoto = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  if (user?.profile_photo) return user.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Unknown')}&background=10B981&color=fff&size=40`
}

const getUserEstimatedHours = (userId: number) => {
  const allocation = editForm.value.teamAllocations.find(a => a.userId === userId)
  return allocation ? allocation.estimatedHours : 0
}

const setUserEstimatedHours = (userId: number, event: Event) => {
  const hours = Number((event.target as HTMLInputElement).value)
  const allocation = editForm.value.teamAllocations.find(a => a.userId === userId)
  if (allocation) {
    allocation.estimatedHours = hours
  }
}

const isUserSelected = (userId: number) => editForm.value.teamAllocations.some(a => a.userId === userId)

const toggleUser = (userId: number) => {
  const idx = editForm.value.teamAllocations.findIndex(a => a.userId === userId)
  if (idx === -1) {
    editForm.value.teamAllocations.push({ userId, effort: 1, estimatedHours: 0 })
  } else {
    editForm.value.teamAllocations.splice(idx, 1)
  }
}

const toggleEdit = () => {
  if (isEditing.value) {
    cancelEdit()
  } else {
    initEditForm()
    isEditing.value = true
  }
}

const cancelEdit = () => {
  isEditing.value = false
  initEditForm()
}

const copyId = async () => {
  if (item.value?.uid) {
    await navigator.clipboard.writeText(item.value.uid)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const { addToast } = useToast()

const saveItem = async () => {
  try {
    const dataToSave = {
      title: editForm.value.title,
      description: editForm.value.description,
      type: editForm.value.type,
      priority: editForm.value.priority,
      status: editForm.value.status,
      sprintId: editForm.value.sprintId,
      parentId: editForm.value.parentId,
      startDate: editForm.value.startDate || null,
      endDate: editForm.value.endDate || null,
      teamAllocations: editForm.value.teamAllocations,
      estimatedHours: calcTotalHours.value,
      estimatedPoints: editForm.value.estimatedPoints
    }

    // Auto-set status to "To Do" when moving from backlog to sprint
    if (!item.value.sprintId && editForm.value.sprintId) {
      dataToSave.status = 'To Do'
    }
    
    // Auto-set status to "Backlog" when moving from sprint to backlog
    if (item.value.sprintId && !editForm.value.sprintId) {
      dataToSave.status = 'Backlog'
    }

    await $fetch(`/api/items?id=${route.params.itemId}`, {
      method: 'PUT',
      body: dataToSave
    })

    // Also update sub-items' sprintId when parent's sprint changes
    if (item.value.sprintId !== editForm.value.sprintId && subItems.value.length > 0) {
      await Promise.all(
        subItems.value.map(sub =>
          $fetch(`/api/items?id=${sub.id}`, {
            method: 'PUT',
            body: { sprintId: editForm.value.sprintId }
          })
        )
      )
    }

    addToast('Item Updated Successfully', 'success')
    isEditing.value = false
    await fetchItem()
  } catch (e) {
    addToast('Failed to save item', 'error')
  }
}

const deleteItem = async () => {
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    await $fetch(`/api/items?id=${route.params.itemId}`, { method: 'DELETE' })
    addToast('Item Deleted Successfully', 'success')
    router.push(`/workspace/projects/${route.params.id}${originPath.value}`)
  } catch (e) {
    addToast('Failed to delete item', 'error')
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateShort = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'

const formatHoursToHHMM = (decimalHours: number | string) => {
  const num = Number(decimalHours)
  if (isNaN(num)) return '00h 00m'
  const h = Math.floor(num)
  const m = Math.round((num - h) * 60)
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`
}

const fetchProject = async () => {
  try {
    const data = await $fetch<any>(`/api/projects?id=${route.params.id}`)
    project.value = data
  } catch (e) {
    console.error('Failed to fetch project')
  }
}

onMounted(async () => {
  await Promise.all([fetchItem(), fetchUsers(), fetchSprints(), fetchProject(), fetchWorkspaceStatuses()])
})

const fetchWorkspaceStatuses = async () => {
  try {
    const data = await $fetch('/api/workspace/statuses')
    workspaceStatuses.value = data.items || []
    if (data.itemTypes) {
      itemTypeSettings.value = data.itemTypes
    }
  } catch (e) {
    console.error('Failed to fetch workspace statuses', e)
  }
}

const canAssignUsers = computed(() => {
  if (!item.value) return true
  return itemTypeSettings.value[item.value.type]?.allowUserAssignment ?? true
})

const canShowEstimatedPoints = computed(() => {
  if (!item.value) return true
  return itemTypeSettings.value[item.value.type]?.allowEstimatedPoints ?? true
})
</script>

<style scoped>
.studio-container {
  padding: 0;
  background: transparent;
  min-height: auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  font-size: 0.85rem;
}
.breadcrumb-link { color: var(--color-text-muted); text-decoration: none; }
.breadcrumb-link:hover { color: var(--color-text-primary); }
.breadcrumb-sep { color: var(--color-border); }
.breadcrumb-current { color: var(--color-text-primary); font-weight: 600; }

.studio-native-content { width: 100%; max-width: 100%; display: flex; flex-direction: column; overflow: visible !important; background: var(--color-bg-card); border-radius: 0 0 20px 20px; padding: 2rem; box-sizing: border-box; }

.studio-view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; gap: 2rem; width: 100%; box-sizing: border-box; }
.studio-titles { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 0; width: 100%; }
.title-row { display: flex; align-items: center; gap: 1rem; width: 100%; box-sizing: border-box; }
.title-input { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); border: 2px solid var(--color-border); background: var(--color-bg-main); border-radius: 8px; padding: 0.5rem 1rem; width: 100%; max-width: 100%; outline: none; box-sizing: border-box; }
.title-input:focus { border-color: var(--primary-color); }
.item-id-badge { display: flex; align-items: center; gap: 0.5rem; background: color-mix(in srgb, var(--primary-color) 10%, transparent); border: 1px solid var(--primary-color); color: var(--primary-color); padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; font-family: monospace; cursor: pointer; transition: all 0.2s; }
.item-id-badge:hover { background: var(--primary-color); color: white; }
.studio-titles h1 { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.025em; margin: 0; }
.studio-titles p { font-size: 0.9rem; color: var(--color-text-secondary); font-weight: 500; margin: 0; }

.header-buttons { display: flex; gap: 1rem; }
.btn-primary-thematic { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
.btn-primary-thematic:hover { filter: brightness(0.9); }
.btn-secondary-thematic { background: var(--color-bg-main); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
.btn-secondary-thematic:hover { background: var(--color-bg-card); border-color: var(--primary-color); color: var(--primary-color); }

.loading-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }

.detail-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
.detail-main { display: flex; flex-direction: column; gap: 2rem; }
.detail-sidebar { display: flex; flex-direction: column; gap: 1rem; }

.detail-section { background: var(--color-bg-main); border: 1px solid var(--color-border-light); border-radius: 16px; padding: 1.5rem; }
.detail-section h3 { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 1rem 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; }
.sub-item-actions { display: flex; gap: 0.5rem; }
.no-content { color: var(--color-text-muted); font-style: italic; }

.sub-items-list { display: flex; flex-direction: column; gap: 0.75rem; }
.sub-item-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.sub-item-row:hover { border-color: var(--primary-color); transform: translateX(4px); }
.si-type-badge { font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; text-transform: uppercase; }
.si-type-badge.story { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.si-type-badge.task { background: var(--color-accent-blue-bg); color: var(--color-accent-blue); }
.si-type-badge.bug { background: var(--color-accent-red-bg); color: var(--color-accent-red); }
.si-info { flex: 1; display: flex; align-items: center; gap: 0.75rem; }
.si-uid { font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); }
.si-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.si-status { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
.si-status.completed { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--color-success); }
.si-status.in-progress { background: var(--color-accent-orange-bg); color: var(--color-accent-orange); }
.si-status.to-do { background: var(--color-bg-subtle); color: var(--color-text-muted); }
.editor-thematic { border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; background: var(--color-bg-card); }

.sidebar-card { background: var(--color-bg-main); border: 1px solid var(--color-border-light); border-radius: 16px; padding: 1.25rem; }
.sidebar-card h4 { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem 0; }
.status-display, .type-display { font-weight: 600; color: var(--color-text-primary); }
.task-id-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.task-id-display { font-weight: 700; color: var(--primary-color); font-family: monospace; font-size: 1.1rem; }
.btn-copy-id { background: var(--color-bg-card); border: 1px solid var(--color-border); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-muted); transition: all 0.2s; flex-shrink: 0; }
.btn-copy-id:hover { border-color: var(--primary-color); color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); transform: translateY(-1px); }
.priority-display { font-weight: 600; text-transform: capitalize; }
.priority-display.high { color: var(--color-danger); }
.priority-display.medium { color: var(--color-warning); }
.priority-display.low { color: var(--primary-color); }

.sprint-pill-active { background: color-mix(in srgb, var(--primary-color) 8%, transparent); color: var(--primary-color); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--primary-color); }
.sprint-pill-backlog { background: var(--color-border-light); color: var(--color-text-secondary); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }

.parent-display { display: flex; align-items: center; }
.parent-pill { background: var(--color-bg-main); color: var(--primary-color); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid var(--primary-color); cursor: pointer; transition: all 0.2s; }
.parent-pill:hover { background: var(--primary-color); color: white; }
.parent-pill-none { background: var(--color-border-light); color: var(--color-text-muted); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

.edit-select, .edit-input { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); border-radius: 8px; font-size: 0.9rem; outline: none; }
.edit-input[type="date"] { 
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
  -webkit-appearance: none;
  appearance: none;
}
.edit-input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 40px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
}
.edit-select:focus, .edit-input:focus { border-color: var(--primary-color); }

.date-info { display: flex; flex-direction: column; gap: 0.75rem; }
.date-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; gap: 1rem; }
.date-row .date-label { color: var(--color-text-muted); margin-bottom: 0; flex-shrink: 0; }
.date-row .edit-input { margin-top: 0.25rem; flex: 1; min-width: 0; }

.meta-card .meta-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
.meta-card .meta-row:last-child { margin-bottom: 0; }

.edit-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--color-border-light); }

.team-list-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.member-card-presentation { background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: 16px; padding: 1.25rem; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.member-card-presentation:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); border-color: var(--primary-color); }
.card-p-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.p-avatar-wrap { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid var(--color-border-light); }
.p-avatar { width: 100%; height: 100%; object-fit: cover; }
.p-user-meta { display: flex; flex-direction: column; }
.p-name { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); }
.p-dept { font-size: 0.65rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.025em; }
.card-p-stats { border-top: 1px solid var(--color-border-light); padding-top: 0.75rem; }
.p-stat { display: flex; flex-direction: column; }
.p-stat-label { font-size: 0.65rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; }
.p-stat-val { font-size: 0.95rem; font-weight: 800; color: var(--primary-color); }
.team-grid-edit { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
.edit-member-card { background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 16px; padding: 1rem; cursor: pointer; position: relative; transition: 0.2s; }
.edit-member-card:hover { border-color: var(--primary-color); background: var(--color-bg-main); }
.edit-member-card.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.card-selection-indicator { position: absolute; top: 0.5rem; right: 0.5rem; width: 20px; height: 20px; background: var(--color-border); color: var(--color-text-muted); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; transition: 0.2s; }
.edit-member-card.selected .card-selection-indicator { background: var(--primary-color); color: white; }
.emc-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.emc-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.emc-info { display: flex; flex-direction: column; }
.emc-name { font-size: 0.8rem; font-weight: 700; color: var(--color-text-primary); }
.emc-dept { font-size: 0.6rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 800; }
.emc-hours-wrap { padding-top: 0.75rem; border-top: 1px solid var(--color-border); margin-top: 0.25rem; }
.emc-hours-wrap label { font-size: 0.6rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; display: block; margin-bottom: 0.4rem; }
.emc-input-row { display: flex; align-items: center; gap: 0.4rem; }
.emc-mini-input { width: 100%; padding: 0.35rem 0.5rem; border: 1.2px solid var(--color-border); background: transparent; color: var(--color-text-primary); border-radius: 6px; font-size: 0.85rem; font-weight: 700; outline: none; }
.emc-mini-input:focus { border-color: var(--primary-color); }
.emc-unit { font-size: 0.65rem; font-weight: 800; color: var(--color-text-muted); }

.hours-display-block { display: flex; flex-direction: column; gap: 1rem; }
.total-hours-container { background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; align-items: center; }
.total-hours-container.auto-calc { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.hours-val { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); }
.hours-label { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
.hours-breakdown { display: flex; flex-direction: column; gap: 0.4rem; padding: 0 0.5rem; }
.breakdown-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
.b-name { color: var(--color-text-muted); font-weight: 500; }
.b-val { color: var(--color-text-primary); font-weight: 700; }

/* TIME LOGS STYLES */
.tl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.tl-header h3 { margin: 0; }
.tl-title-group { display: flex; align-items: center; gap: 1rem; }
.tl-total { font-size: 0.75rem; font-weight: 800; background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
.tl-desc { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.2rem; background: var(--color-bg-card); padding: 0.5rem 0.75rem; border-radius: 6px; font-style: italic; }

/* TL Modal CSS */
.btn-primary-thematic { background: var(--primary-color); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-primary-thematic:hover:not(:disabled) { filter: brightness(0.9); }
.btn-primary-thematic:disabled { background: var(--color-border); color: var(--color-text-muted); cursor: not-allowed; }
.btn-secondary-thematic { background: var(--color-bg-card); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-secondary-thematic:hover { background: var(--color-bg-main); border-color: var(--primary-color); color: var(--primary-color); }
.btn-danger-thematic { background: var(--color-danger); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-danger-thematic:hover { background: #DC2626; }

.tl-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-container { background: var(--color-bg-card); width: 100%; max-width: 900px; max-height: 90vh; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; }
.modal-header { padding: 1.25rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; align-items: center; gap: 1rem; }
.modal-header h2 { margin: 0; flex: 1; font-size: 1.15rem; font-weight: 600; color: var(--color-text-primary); }
.tl-modal { background: var(--color-bg-card); border-radius: 20px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); animation: popModal 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes popModal { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
.tl-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--color-border-light); }
.tl-modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: 0.2s; }
.close-btn:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.tl-modal-body { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
.tl-modal-input { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid var(--color-border); background: var(--color-bg-main); color: var(--color-text-primary); border-radius: 10px; font-size: 0.9rem; font-weight: 500; outline: none; transition: 0.2s; box-sizing: border-box; }
.tl-modal-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent); }
.tl-textarea { height: 80px; resize: none; font-family: inherit; }
.tl-modal-footer { padding: 1.25rem 1.75rem; border-top: 1px solid var(--color-border-light); display: flex; justify-content: flex-end; gap: 0.75rem; background: var(--color-bg-main); border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; }
.tl-list { display: flex; flex-direction: column; gap: 0.75rem; }
.tl-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--color-border-light); flex-shrink: 0; }
.tl-entry { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); transition: 0.2s; }
.tl-entry:hover { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.03); transform: translateY(-1px); }
.tl-details { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.tl-user-row { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
.tl-name { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); }
.tl-date { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); }
.tl-meta { font-size: 0.7rem; color: var(--color-text-muted); }
.tl-hours-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.tl-actions { display: flex; gap: 0.35rem; opacity: 0; transition: 0.2s; }
.tl-entry:hover .tl-actions { opacity: 1; }
.tl-action-btn { background: var(--color-bg-main); border: none; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-secondary); transition: 0.2s; padding: 0; margin: 0; }
.tl-action-btn.edit:hover { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.tl-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.tl-hours { font-size: 1rem; font-weight: 800; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 10%, transparent); padding: 0.25rem 0.5rem; border-radius: 6px; display: inline-block; }

/* Associate Modal Styles */
.modal-body-search { padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border-light); }
.search-input { width: 100%; padding: 0.85rem 1rem; border: 1.5px solid var(--color-border); background: var(--color-bg-main); color: var(--color-text-primary); border-radius: 10px; font-size: 0.95rem; outline: none; transition: 0.2s; }
.search-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent); }

.associate-items-list { padding: 1rem 1.5rem; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
.associate-item-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; background: var(--color-bg-main); border: 1.5px solid var(--color-border-light); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.associate-item-row:hover { border-color: var(--primary-color); }
.associate-item-row.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }

.checkbox-col { flex-shrink: 0; }
.checkbox-indicator { width: 22px; height: 22px; border: 2px solid var(--color-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.associate-item-row.selected .checkbox-indicator { background: var(--primary-color); border-color: var(--primary-color); color: white; }

.item-type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0; }
.item-type-badge.story { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.item-type-badge.task { background: rgba(59, 130, 246, 0.15); color: var(--color-accent-blue); }
.item-type-badge.bug { background: rgba(239, 68, 68, 0.15); color: var(--color-accent-red); }

.item-info { flex: 1; display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.item-uid { font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--primary-color); flex-shrink: 0; }
.item-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.item-status { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 6px; flex-shrink: 0; }
.item-status.backlog { background: var(--color-border-light); color: var(--color-text-muted); }
.item-status.to-do { background: var(--color-border); color: var(--color-text-secondary); }
.item-status.in-progress { background: rgba(59, 130, 246, 0.15); color: var(--color-info); }
.item-status.completed { background: #D0FBE0; color: #065F46; }

.modal-footer-simple { padding: 1rem 1.5rem; border-top: 1px solid var(--color-border-light); display: flex; justify-content: flex-end; gap: 0.75rem; background: var(--color-bg-main); }
</style>
