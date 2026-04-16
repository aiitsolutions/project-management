<template>
  <div :key="`sprints-${route.params.id}`" class="board-workspace-container">
    <!-- Top Filter & Action Bar -->
    <header class="board-header-row">
      <div class="header-left-actions">
        <!-- Custom Premium Dropdown -->
        <div class="custom-sprint-selector" v-click-outside="() => isSelectorOpen = false">
          <div class="selector-trigger" @click="isSelectorOpen = !isSelectorOpen" :class="{ 'is-loading': loading }">
            <div class="trigger-content">
              <svg class="selector-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <div v-if="loading" class="selected-info">
                 <SkeletonLoader width="120px" height="16px" radius="4px" />
              </div>
              <div v-else-if="selectedSprint" class="selected-info">
                <span class="selected-name">{{ selectedSprint.name }}</span>
                <span class="selected-status-pill" :class="selectedSprint.status.toLowerCase().replace(' ', '-')">{{ selectedSprint.status }}</span>
              </div>
              <span v-else class="placeholder">Select Sprint</span>
            </div>
            <svg class="chevron-icon" :class="{ 'open': isSelectorOpen }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <transition name="dropdown">
            <div v-if="isSelectorOpen" class="selector-dropdown-pane">
              <div v-if="activeSprints.length > 0" class="dropdown-group">
                <div class="group-label">Active Sprint</div>
                <div v-for="s in activeSprints" :key="s.id" class="dropdown-option" :class="{ active: selectedSprintId === s.id }" @click="selectSprint(s.id)">
                  <span class="option-name">{{ s.name }}</span>
                  <span class="option-dates">{{ formatDateShort(s.startDate) }}</span>
                </div>
              </div>
              <div v-if="upcomingSprints.length > 0" class="dropdown-group">
                <div class="group-label">Upcoming</div>
                <div v-for="s in upcomingSprints" :key="s.id" class="dropdown-option" :class="{ active: selectedSprintId === s.id }" @click="selectSprint(s.id)">
                  <span class="option-name">{{ s.name }}</span>
                  <span class="option-dates">{{ formatDateShort(s.startDate) }}</span>
                </div>
              </div>
              <div v-if="completedSprints.length > 0" class="dropdown-group">
                <div class="group-label">Completed</div>
                <div v-for="s in completedSprints" :key="s.id" class="dropdown-option" :class="{ active: selectedSprintId === s.id }" @click="selectSprint(s.id)">
                  <span class="option-name">{{ s.name }}</span>
                  <span class="option-dates">{{ formatDateShort(s.startDate) }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <button class="btn-sprint-details" @click="showSprintDetail = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span>View Details</span>
        </button>
        <button class="btn-create-sprint" @click="openCreateSprintModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Create Sprint</span>
        </button>
      </div>

      <div class="header-right-actions">
        <div class="board-search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input v-model="searchQuery" type="text" placeholder="Search tasks in this board..." class="board-search-input" />
        </div>
        <button class="btn-board-filter" :class="{ 'active': showFilterSidebar }" @click="showFilterSidebar = !showFilterSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span>Filters</span>
          <span v-if="activeFilterCount > 0" class="filter-count-badge">{{ activeFilterCount }}</span>
        </button>
      </div>
    </header>

    <main class="board-content-area">
      <!-- Loading Board Skeleton -->
      <div v-if="loading" class="board-layout">
        <div v-for="col in columns" :key="col.id" class="board-column">
           <header class="column-header">
              <div class="column-title-group">
                 <SkeletonLoader width="80px" height="20px" />
              </div>
           </header>
           <div class="column-body show-scrollbar">
              <div v-for="i in 3" :key="i" class="board-task-card skeleton">
                 <SkeletonLoader width="100%" height="16px" class="mb-2" />
                 <SkeletonLoader width="60%" height="12px" class="mb-4" />
                 <div style="display:flex; justify-content:space-between; align-items:center">
                    <SkeletonLoader width="40px" height="15px" />
                    <SkeletonLoader width="24px" height="24px" radius="50%" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div v-else-if="selectedSprint" class="board-layout" :class="{ 'fit-to-screen': shouldFitToScreen }">
        <div
          v-for="column in columns"
          :key="column.id"
          class="board-column"
          :class="{ 'drop-active': dragOverColumnId === column.id, 'fit-column': shouldFitToScreen }"
          :style="shouldFitToScreen ? { width: columnWidth } : {}"
          @dragover.prevent="onDragOverColumn(column.id)"
          @dragleave="onDragLeaveColumn"
          @drop="onDrop(column.id, $event)"
        >
          <header class="column-header">
            <div class="column-title-group">
               <div class="column-dot" :class="column.cls"></div>
               <h3 class="column-name">{{ column.name }}</h3>
<span class="column-count">{{ getColumnCountWithSubs(column.id) }}</span>
             </div>
             <div class="column-type-counts">
                <span class="type-count story" :class="{ active: getTypeCountWithSubs(column.id, 'Story') > 0 }">{{ getTypeCountWithSubs(column.id, 'Story') }}</span>
                <span class="type-count task" :class="{ active: getTypeCountWithSubs(column.id, 'Task') > 0 }">{{ getTypeCountWithSubs(column.id, 'Task') }}</span>
                <span class="type-count bug" :class="{ active: getTypeCountWithSubs(column.id, 'Bug') > 0 }">{{ getTypeCountWithSubs(column.id, 'Bug') }}</span>
             </div>
          </header>

          <div class="column-body show-scrollbar">
            <!-- Parent Items -->
            <div v-for="item in getColumnParentItems(column.id)" :key="item.id"
              class="board-task-card"
              draggable="true"
              @dragstart="onDragStartBoard(item.id, false, $event)"
              @click="viewItem(item.id)"
            >
              <div class="task-card-accent" :class="item.type.toLowerCase()"></div>
              <div class="task-card-main">
                <div class="task-card-top">
                  <div class="type-icon-group">
                    <span class="type-icon" :class="item.type.toLowerCase()">
                      <svg v-if="item.type === 'Story'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                      <svg v-else-if="item.type === 'Task'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <svg v-else-if="item.type === 'Bug'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </span>
                    <span class="task-uid">{{ item.uid }}</span>
                  </div>
                  <div class="task-card-meta-right">
                    <template v-if="canShowAssignee(item.type)">
                      <img v-if="item.teamAllocations?.length > 0" :src="getUserPhoto(item.teamAllocations[0].userId)" class="task-user-avatar" />
                      <span v-else class="unassigned-avatar">U</span>
                    </template>
                  </div>
                </div>
                <h4 class="task-title">{{ item.title }}</h4>
                <div class="task-card-bottom">
                  <div class="priority-indicator" :class="item.priority?.toLowerCase()">
                    <span class="priority-dot"></span>
                    <span class="priority-label">{{ item.priority }}</span>
                  </div>
                  <div v-if="item.estimatedPoints && canShowPoints(item.type)" class="story-points">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    {{ item.estimatedPoints }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Collapsible Sub Items -->
            <div v-if="getColumnSubItems(column.id).length > 0" class="sub-items-section">
              <div class="sub-items-toggle" @click="toggleColumnCollapse(column.id)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: collapsedColumns.has(column.id) }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>Sub-items ({{ getColumnSubItems(column.id).length }})</span>
              </div>
              <transition name="collapse">
                <div v-if="!collapsedColumns.has(column.id)" class="sub-items-list">
                  <template v-for="group in getSubItemsGroupedByParent(column.id)" :key="group.parentId">
                    <div class="sub-items-parent-header">
                      <span class="parent-header-uid">{{ sprintItems.find(i => i.id === group.parentId)?.uid }}</span>
                      <span class="parent-header-type">{{ sprintItems.find(i => i.id === group.parentId)?.type }}</span>
                      <span class="parent-header-title">{{ sprintItems.find(i => i.id === group.parentId)?.title }}</span>
                    </div>
                    <div v-for="item in group.items" :key="item.id"
                      class="board-task-card sub-item-card"
                      draggable="true"
                      @dragstart="onDragStartBoard(item.id, true, $event)"
                      @click="viewItem(item.id)"
                    >
                      <div class="task-card-accent sub-item-accent"></div>
                      <div class="task-card-main">
                        <div class="task-card-top">
                          <div class="type-icon-group">
                            <span class="type-icon" :class="item.type.toLowerCase()">
                              <svg v-if="item.type === 'Story'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                              <svg v-else-if="item.type === 'Task'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              <svg v-else-if="item.type === 'Bug'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </span>
                            <span class="task-uid">{{ item.uid }}</span>
                          </div>
                        </div>
                        <h4 class="task-title">{{ item.title }}</h4>
                        <div class="task-card-bottom">
                          <div class="priority-indicator" :class="item.priority?.toLowerCase()">
                            <span class="priority-dot"></span>
                            <span class="priority-label">{{ item.priority }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </transition>
            </div>

            <!-- Add Item Button -->
            <button class="add-task-btn" @click="openCreateModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-sprint-selected">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <h3>No Sprint Selected</h3>
        <p>Select a sprint from the dropdown above to view its board</p>
      </div>
    </main>

    <!-- Filter Sidebar -->
    <transition name="slide">
      <aside v-if="showFilterSidebar" class="filter-sidebar">
        <div class="filter-header">
          <h3>Filters</h3>
          <button class="btn-clear-filters" @click="clearFilters">Clear All</button>
        </div>
        <div class="filter-body">
           <!-- Status Filter -->
           <div class="filter-section">
              <label>Status</label>
              <div class="filter-options-stack">
                 <div v-for="s in workspaceStatuses" :key="s.id"
                      class="filter-opt-row" @click="toggleFilter('statuses', s.name)">
                    <div class="opt-check" :class="{ checked: filters.statuses.includes(s.name) }">
                      <svg v-if="filters.statuses.includes(s.name)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>{{ s.name }}</span>
                 </div>
              </div>
           </div>

           <!-- Type Filter -->
           <div class="filter-section">
              <label>Item Type</label>
              <div class="filter-options-stack">
                 <div v-for="t in ['Story', 'Task', 'Bug']" :key="t"
                      class="filter-opt-row" @click="toggleFilter('types', t)">
                    <div class="opt-check" :class="{ checked: filters.types.includes(t) }">
                      <svg v-if="filters.types.includes(t)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>{{ t }}</span>
                 </div>
              </div>
           </div>

           <!-- Priority Filter -->
           <div class="filter-section">
              <label>Priority</label>
              <div class="filter-options-stack">
                 <div v-for="p in ['Low', 'Medium', 'High']" :key="p"
                      class="filter-opt-row" @click="toggleFilter('priorities', p)">
                    <div class="opt-check" :class="{ checked: filters.priorities.includes(p) }">
                      <svg v-if="filters.priorities.includes(p)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>{{ p }}</span>
                 </div>
              </div>
           </div>

           <!-- User Filter -->
           <div class="filter-section">
              <label>Assignee</label>
              <div class="filter-users-list">
                 <div v-for="u in users" :key="u.id"
                      class="filter-user-row" @click="toggleFilter('userIds', u.id)">
                    <img :src="getUserPhoto(u.id)" class="filter-user-avatar" />
                    <span>{{ u.name }}</span>
                    <div class="opt-check small" :class="{ checked: filters.userIds.includes(u.id) }">
                      <svg v-if="filters.userIds.includes(u.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </aside>
    </transition>

    <!-- Sprint Detail Modal -->
    <div v-if="showSprintDetail && selectedSprint" class="modal-overlay" @click.self="showSprintDetail = false">
      <div class="sprint-detail-modal">
        <div class="modal-header">
          <h2>Sprint Details</h2>
          <button class="btn-close" @click="showSprintDetail = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <label>Sprint Name</label>
            <span>{{ selectedSprint.name }}</span>
          </div>
          <div class="detail-row">
            <label>Status</label>
            <span class="status-badge" :class="selectedSprint.status.toLowerCase().replace(' ', '-')">{{ selectedSprint.status }}</span>
          </div>
          <div class="detail-row">
            <label>Duration</label>
            <span>{{ sprintDurationDays }} days</span>
          </div>
          <div class="detail-row">
            <label>Start Date</label>
            <span>{{ formatDate(selectedSprint.startDate) }}</span>
          </div>
          <div class="detail-row">
            <label>End Date</label>
            <span>{{ formatDate(selectedSprint.endDate) }}</span>
          </div>
          <div class="detail-row">
            <label>Items</label>
            <span>{{ sprintItems.length }} items in sprint</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" @click="confirmDeleteSprint">Delete Sprint</button>
          <div class="footer-right">
            <button class="btn btn-secondary" @click="showSprintDetail = false">Close</button>
            <button class="btn btn-primary" @click="editSprint">Edit Sprint</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Item Modal -->
    <CreateItemModal
      v-if="showCreateModal"
      :key="modalKey"
      :is-open="showCreateModal"
      :initial-sprint-id="selectedSprintId"
      :project-id="Number(route.params.id)"
      @close="showCreateModal = false"
      @submit="onItemCreated"
    />

    <!-- Create/Edit Sprint Modal -->
    <div v-if="showSprintModal" class="modal-overlay" @click.self="showSprintModal = false">
      <div class="modal-container sprint-modal">
        <div class="modal-header">
          <h2>{{ sprintForm.id ? 'Edit Sprint' : 'Create New Sprint' }}</h2>
          <button class="close-btn" @click="showSprintModal = false">×</button>
        </div>
        <form @submit.prevent="createSprint" class="modal-form-wrapper">
          <div class="scrollable-form-content">
            <div class="form-main-layout">
              <div class="form-column-left">
                <div class="input-group">
                  <label>Sprint Title</label>
                  <input type="text" v-model="sprintForm.name" required placeholder="e.g. Sprint 1 - Core Features" />
                </div>
                <div class="input-group">
                  <label>Description</label>
                  <textarea v-model="sprintForm.description" class="textarea-input" placeholder="Describe the goals and scope of this sprint..."></textarea>
                </div>
              </div>
              <div class="form-column-right">
                <div class="input-group">
                  <label>Sprint Owner</label>
                  <select v-model="sprintForm.ownerId" class="select-input">
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <div class="input-group">
                    <label>Start Date</label>
                    <input type="date" v-model="sprintForm.startDate" required />
                  </div>
                  <div class="input-group">
                    <label>End Date</label>
                    <input type="date" v-model="sprintForm.endDate" required />
                  </div>
                </div>
                <div class="input-group" v-if="sprintForm.id">
                  <label>Sprint Status</label>
                  <select v-model="sprintForm.status" class="select-input">
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="form-section-divider"></div>
            <div class="input-group">
              <div class="section-label-row">
                <label>Sprint Users</label>
                <span class="selection-count">{{ sprintForm.memberIds.length }} Selected</span>
              </div>
              <div class="user-selection-grid">
                <div v-for="user in users" :key="user.id" class="user-checkbox-item" :class="{ selected: sprintForm.memberIds.includes(user.id) }" @click="toggleUser(user.id)">
                  <img :src="`https://ui-avatars.com/api/?name=${user.name}&background=10B981&color=fff`" class="checkbox-avatar" />
                  <div class="user-selection-info">
                    <span class="uname">{{ user.name }}</span>
                    <span class="uemail">{{ user.email }}</span>
                  </div>
                  <div class="checkbox-indicator">
                    <svg v-if="sprintForm.memberIds.includes(user.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions sticky-footer">
            <button type="button" class="btn-cancel" @click="showSprintModal = false">Discard Changes</button>
            <button type="submit" class="btn-save">{{ sprintForm.id ? 'Update Sprint' : 'Create Sprint' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
  ssr: false
})

import { ref, computed, onMounted, onUnmounted, watch, onActivated, nextTick } from 'vue'
import { useSettings } from '~/composables/useSettings'

const route = useRoute()
const router = useRouter()

const lastFetchTime = ref(0)
const MIN_REFETCH_INTERVAL = 1000

const refreshBoard = () => {
  const now = Date.now()
  if (now - lastFetchTime.value > MIN_REFETCH_INTERVAL) {
    fetchSprints()
    lastFetchTime.value = now
  }
}

onActivated(refreshBoard)

watch(() => route.fullPath, (newPath, oldPath) => {
  if (oldPath && newPath.includes('/sprints') && !oldPath.includes('/items/')) {
    refreshBoard()
  }
})

const releases = ref([])
const sprints = ref([])
const sprintItems = ref([])
const users = ref([])
const workspaceStatuses = ref<any[]>([])
const subItemsMap = ref(new Map<number, any[]>())
const { settings: appSettings } = useSettings()
const expandedBoardItems = ref(new Set<number>())
const itemTypeSettings = ref<any>({
  Story: { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
  Task:  { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
  Bug:   { allowEstimatedPoints: false, canBeSubItem: true, allowUserAssignment: true }
})

const canShowPoints = (itemType: string) => {
  return itemTypeSettings.value[itemType]?.allowEstimatedPoints ?? true
}

const canShowAssignee = (itemType: string) => {
  return itemTypeSettings.value[itemType]?.allowUserAssignment ?? true
}
const loading = ref(false)
const selectedSprintId = ref(null)
const searchQuery = ref('')
const isSelectorOpen = ref(false)
const draggedItemId = ref(null)
const draggedItemIsSubItem = ref(false)
const dragOverColumnId = ref(null)
const showSprintDetail = ref(false)
const showFilterSidebar = ref(false)
const showPointsDropdown = ref(false)
const collapsedColumns = ref(new Set<string>())
const filters = ref({
  userIds: [],
  statuses: [],
  types: [],
  priorities: [],
  point: null
})

const showSprintModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showDeleteWarningModal = ref(false)
const sprintForm = ref({
  id: null,
  name: '',
  description: '',
  ownerId: 1,
  memberIds: [],
  startDate: '',
  endDate: '',
  status: 'Not Started'
})
const sprintDurationDays = ref(0)

const idCopied = ref(false)
const copyUID = (uid: string) => {
  navigator.clipboard.writeText(uid)
  idCopied.value = true
  setTimeout(() => { idCopied.value = false }, 2000)
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.userIds.length) count++
  if (filters.value.statuses.length) count++
  if (filters.value.types.length) count++
  if (filters.value.priorities.length) count++
  if (filters.value.point !== null) count++
  return count
})

const columns = computed(() => {
  return workspaceStatuses.value.map((status, index) => ({
    id: status.name,
    name: status.name,
    cls: status.name.toLowerCase().replace(/\s+/g, '-')
  }))
})

const columnWidth = computed(() => {
  const count = columns.value.length
  if (count <= 3) {
    return `calc(${100 / count}% - 1rem)`
  }
  return '320px'
})

const shouldFitToScreen = computed(() => columns.value.length <= 3)

const activeSprints = computed(() => sprints.value.filter(s => s.status === 'In Progress'))
const upcomingSprints = computed(() => sprints.value.filter(s => s.status === 'Not Started'))
const completedSprints = computed(() => sprints.value.filter(s => s.status === 'Completed'))
const selectedSprint = computed(() => sprints.value.find(s => s.id === selectedSprintId.value))
const boardSprintItems = computed(() => {
  let items = sprintItems.value.filter(i => i.sprintId === selectedSprintId.value && !i.parentId)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.uid.toLowerCase().includes(q))
  }
  
  if (filters.value.userIds.length > 0) {
    items = items.filter(i => i.teamAllocations?.some(a => filters.value.userIds.includes(a.userId)))
  }
  
  if (filters.value.statuses.length > 0) {
    items = items.filter(i => filters.value.statuses.includes(i.status))
  }
  
  if (filters.value.types.length > 0) {
    items = items.filter(i => filters.value.types.includes(i.type))
  }
  
  if (filters.value.priorities.length > 0) {
    items = items.filter(i => filters.value.priorities.includes(i.priority))
  }
  
  if (filters.value.point !== null) {
    items = items.filter(i => {
      const pts = i.estimatedPoints !== undefined && i.estimatedPoints !== null 
                  ? i.estimatedPoints 
                  : (i.teamAllocations?.reduce((acc, a) => acc + (a.effort || 0), 0) || 0)
      return pts === filters.value.point
    })
  }
  
  return items
})

const getColumnItems = (columnId: string) => {
  let parentItems = boardSprintItems.value.filter(i => i.status === columnId)
  let subItems = sprintItems.value.filter(i => i.parentId && i.status === columnId)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    parentItems = parentItems.filter(i => i.title.toLowerCase().includes(q) || i.uid.toLowerCase().includes(q))
    subItems = subItems.filter(i => i.title.toLowerCase().includes(q) || i.uid.toLowerCase().includes(q))
  }
  
  return [...parentItems, ...subItems]
}

const getColumnCountWithSubs = (columnId: string) => {
  const currentSprintId = selectedSprintId.value
  const parentItems = boardSprintItems.value.filter(i => 
    i.status === columnId &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  const subItems = sprintItems.value.filter(i => 
    i.parentId && i.status === columnId &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  return parentItems.length + subItems.length
}

const getTypeCount = (columnId: string, type: string) => {
  return getColumnItems(columnId).filter(i => i.type === type).length
}

const getTypeCountWithSubs = (columnId: string, type: string) => {
  const currentSprintId = selectedSprintId.value
  const parentItems = boardSprintItems.value.filter(i => 
    i.status === columnId &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  const subItems = sprintItems.value.filter(i => 
    i.parentId && i.status === columnId && i.type === type &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  return parentItems.filter(i => i.type === type).length + subItems.length
}

const getSubItems = (parentId: number) => {
  return subItemsMap.value?.get(parentId) || []
}

const toggleExpandBoardItem = (itemId: number) => {
  if (expandedBoardItems.value.has(itemId)) {
    expandedBoardItems.value.delete(itemId)
  } else {
    expandedBoardItems.value.add(itemId)
  }
}

const getUserPhoto = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  const themeColor = appSettings.value?.colorScheme?.replace('#', '') || '10B981'
  return user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${themeColor}&color=fff`
}

const isSubItem = (item: any) => !!item.parentId

const getParentTitle = (parentId: number) => {
  const parent = sprintItems.value.find(i => i.id === parentId)
  return parent?.uid || ''
}

const getColumnParentItems = (columnId: string) => {
  const currentSprintId = selectedSprintId.value
  let items = boardSprintItems.value.filter(i => 
    i.status === columnId &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.uid.toLowerCase().includes(q))
  }
  return items
}

const getColumnSubItems = (columnId: string) => {
  const currentSprintId = selectedSprintId.value
  let items = sprintItems.value.filter(i => 
    i.parentId && 
    i.status === columnId &&
    (columnId === 'Backlog' ? !i.sprintId : i.sprintId === currentSprintId)
  )
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.uid.toLowerCase().includes(q))
  }
  return items
}

const getSubItemsGroupedByParent = (columnId: string) => {
  const subItems = getColumnSubItems(columnId)
  const grouped: Record<number, any[]> = {}
  subItems.forEach(item => {
    const pid = item.parentId
    if (!grouped[pid]) {
      grouped[pid] = []
    }
    grouped[pid].push(item)
  })
  const result: { parentId: number, items: any[] }[] = []
  Object.keys(grouped).forEach(pid => {
    result.push({ parentId: Number(pid), items: grouped[Number(pid)] })
  })
  return result
}

const toggleColumnCollapse = (columnId: string) => {
  if (collapsedColumns.value.has(columnId)) {
    collapsedColumns.value.delete(columnId)
  } else {
    collapsedColumns.value.add(columnId)
  }
}

const getUserName = (userId: number) => {
  const user = users.value.find(u => u.id === userId)
  return user?.name || 'Unknown'
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateShort = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const toggleFilter = (filterType: string, value: any) => {
  const arr = filters.value[filterType] as any[]
  const idx = arr.indexOf(value)
  if (idx === -1) {
    (filters.value as any)[filterType].push(value)
  } else {
    (filters.value as any)[filterType].splice(idx, 1)
  }
}

const clearFilters = () => {
  filters.value = {
    userIds: [],
    statuses: [],
    types: [],
    priorities: [],
    point: null
  }
}

const activeItem = ref(null)

const canBeSubItem = (itemType: string) => {
  return itemTypeSettings.value[itemType]?.canBeSubItem ?? true
}

const onDragStartBoard = (itemId: number, isSubItem = false, event: DragEvent) => {
  if (event) {
    event.dataTransfer?.setData('text/plain', itemId.toString())
    event.dataTransfer?.setData('isSubItem', isSubItem.toString())
  }
  if (!isSubItem) {
    const item = sprintItems.value.find((i: any) => i.id === itemId)
    if (item && !canBeSubItem(item.type) && item.parentId) {
      alert(`${item.type} cannot be added as a sub-item. Disable this in Workspace Settings.`)
      return
    }
  }
  draggedItemId.value = itemId
  draggedItemIsSubItem.value = isSubItem
}

const onDragOverColumn = (columnId: string) => {
  dragOverColumnId.value = columnId
}

const onDragLeaveColumn = () => {
  dragOverColumnId.value = null
}

const onDrop = async (columnId: string, event?: DragEvent) => {
  let itemId = draggedItemId.value
  let isSub = draggedItemIsSubItem.value
  
  console.log('onDrop start:', { itemId, isSub, columnId, hasEvent: !!event })
  
  if (!itemId && event) {
    itemId = parseInt(event.dataTransfer?.getData('text/plain') || '0')
    isSub = event.dataTransfer?.getData('isSubItem') === 'true'
    console.log('onDrop from event:', { itemId, isSub })
  }
  
  if (!itemId) {
    console.log('No itemId, returning')
    return
  }
  
  try {
    const isBacklog = columnId === 'Backlog'
    const body = isBacklog 
      ? { status: 'Backlog', sprintId: null }
      : { status: columnId, sprintId: selectedSprintId.value }
    
    console.log('Updating item:', itemId, 'to:', body)
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: body
    })
    await fetchSprints()
  } catch (e) {
    console.error('Failed to update item status', e)
  } finally {
    draggedItemId.value = null
    draggedItemIsSubItem.value = false
    dragOverColumnId.value = null
  }
}

const makeSubItemToItem = async (itemId: number) => {
  const subItem = sprintItems.value.find((i: any) => i.id === itemId)
  const parentItem = subItem?.parentId ? sprintItems.value.find((i: any) => i.id === subItem.parentId) : null
  
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { 
        parentId: null,
        sprintId: parentItem?.sprintId || selectedSprintId.value
      }
    })
    await fetchSprints()
  } catch (e) {
    console.error('Failed to make subitem to item', e)
  }
}

const selectSprint = (sprintId: number) => {
  selectedSprintId.value = sprintId
  isSelectorOpen.value = false
}

const viewItem = (itemId: number) => {
  router.push(`/workspace/projects/${route.params.id}/items/${itemId}?from=board`)
}

const showCreateModal = ref(false)
const modalKey = ref(0)

const openCreateModal = () => {
  modalKey.value++
  showCreateModal.value = true
}

const onItemCreated = () => {
  showCreateModal.value = false
  handleItemCreated()
}

const handleItemCreated = () => {
  fetchSprints()
}

const openCreateSprintModal = () => {
  sprintForm.value = {
    id: null,
    name: '',
    description: '',
    ownerId: 1,
    memberIds: [],
    startDate: '',
    endDate: '',
    status: 'Not Started'
  }
  showSprintModal.value = true
}

const editSprint = () => {
  showSprintDetail.value = false
  sprintForm.value = {
    id: selectedSprint.value.id,
    name: selectedSprint.value.name,
    description: selectedSprint.value.description || '',
    ownerId: selectedSprint.value.ownerId,
    memberIds: selectedSprint.value.memberIds || [],
    startDate: selectedSprint.value.startDate,
    endDate: selectedSprint.value.endDate,
    status: selectedSprint.value.status
  }
  showSprintModal.value = true
}

const createSprint = async () => {
  try {
    const isEditing = !!sprintForm.value.id
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/sprints?id=${sprintForm.value.id}` : '/api/sprints'

    await $fetch(url, {
      method,
      body: {
        projectId: Number(route.params.id),
        name: sprintForm.value.name,
        description: sprintForm.value.description,
        ownerId: sprintForm.value.ownerId,
        memberIds: sprintForm.value.memberIds,
        startDate: sprintForm.value.startDate,
        endDate: sprintForm.value.endDate,
        status: sprintForm.value.status
      }
    })
    
    showSprintModal.value = false
    sprintForm.value = {
      id: null,
      name: '',
      description: '',
      ownerId: 1,
      memberIds: [],
      startDate: '',
      endDate: '',
      status: 'Not Started'
    }
    await fetchSprints()
  } catch (e) {
    alert('Failed to save sprint')
  }
}

const toggleUser = (userId: number) => {
  const index = sprintForm.value.memberIds.indexOf(userId)
  if (index === -1) {
    sprintForm.value.memberIds.push(userId)
  } else {
    sprintForm.value.memberIds.splice(index, 1)
  }
}

const confirmDeleteSprint = async () => {
  if (!confirm(`Are you sure you want to delete "${selectedSprint.value.name}"? This will also move all items in this sprint back to backlog.`)) return
  try {
    await $fetch(`/api/sprints?id=${selectedSprint.value.id}`, {
      method: 'DELETE'
    })
    showSprintDetail.value = false
    addToast('Sprint deleted successfully', 'success')
    await fetchSprints()
  } catch (e) {
    addToast('Failed to delete sprint', 'error')
  }
}

const { addToast } = useToast()

const fetchSprints = async () => {
  loading.value = true
  try {
    const [sData, iData, relData, uData, statusData] = await Promise.all([
      $fetch(`/api/sprints?projectId=${route.params.id}`),
      $fetch(`/api/items?projectId=${route.params.id}`),
      $fetch(`/api/releases?projectId=${route.params.id}`),
      $fetch(`/api/users`),
      $fetch<any>('/api/workspace/statuses')
    ])
    console.log('API response - sprints:', sData, 'items:', iData?.length)
    sprints.value = sData
    sprintItems.value = iData
    releases.value = relData
    users.value = uData
    workspaceStatuses.value = statusData.items || []
    if (statusData.itemTypes) {
      itemTypeSettings.value = statusData.itemTypes
    }
    
    subItemsMap.value = new Map(iData.filter((i: any) => i.parentId).map((i: any) => [i.parentId, iData.filter((sub: any) => sub.parentId === i.parentId)]))
    
    if (selectedSprintId.value) {
      const stillExists = (sData as any[]).find(s => s.id === selectedSprintId.value)
      if (!stillExists) {
        const active = (sData as any[]).find(s => s.status === 'In Progress')
        selectedSprintId.value = active ? active.id : (sData[0]?.id ?? null)
      }
    } else {
      const active = (sData as any[]).find(s => s.status === 'In Progress')
      selectedSprintId.value = active ? active.id : (sData[0]?.id ?? null)
    }
  } catch (e) {
    console.error('Failed to fetch board data', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSprints()
})

watch(() => route.fullPath, () => {
  fetchSprints()
})
</script>

<style>
/* Force scrollbars always visible on this page */
* {
  scrollbar-width: auto !important;
  scrollbar-color: #9ca3af #e5e7eb !important;
}

::-webkit-scrollbar {
  width: 12px !important;
  height: 12px !important;
  display: block !important;
}

::-webkit-scrollbar-track {
  background: #e5e7eb !important;
  border-radius: 6px !important;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af !important;
  border-radius: 6px !important;
  border: 3px solid #e5e7eb !important;
}
</style>

<style scoped>
.board-workspace-container { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
  height: 100vh; 
  padding: 1.5rem; 
  background: var(--color-bg-card);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  overflow: hidden;
}

.board-header-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1.5px solid var(--color-border-light); overflow: visible; }
.header-left-actions { display: flex; align-items: center; gap: 1.25rem; }
.header-right-actions { display: flex; align-items: center; gap: 1rem; }

.custom-sprint-selector { position: relative; min-width: 320px; overflow: visible; }
.selector-trigger { display: flex; align-items: center; justify-content: space-between; background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 12px; padding: 0.6rem 1rem; cursor: pointer; transition: all 0.2s; }
.selector-trigger:hover { border-color: var(--primary-color); }
.trigger-content { display: flex; align-items: center; gap: 0.75rem; }
.selector-icon { color: var(--primary-color); }
.selected-info { display: flex; align-items: center; gap: 0.75rem; }
.selected-name { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); }
.selected-status-pill { font-size: 0.6rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
.selected-status-pill.in-progress { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.selected-status-pill.not-started { background: var(--color-border-light); color: var(--color-text-secondary); }
.selected-status-pill.completed { background: var(--nav-active-bg, #F0FDF4); color: var(--primary-color); }
.chevron-icon { color: var(--color-text-muted); transition: transform 0.3s ease; }
.chevron-icon.open { transform: rotate(180deg); color: var(--primary-color); }
.placeholder { font-size: 0.9rem; color: var(--color-text-muted); }

.selector-dropdown-pane { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 9999; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.dropdown-group { display: flex; flex-direction: column; gap: 0.25rem; }
.group-label { font-size: 0.65rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; padding: 0.5rem 0.75rem; letter-spacing: 0.05em; }
.dropdown-option { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.dropdown-option:hover { background: var(--color-bg-main); }
.dropdown-option.active { background: var(--nav-active-bg, #F0FDF4); border-left: 3px solid var(--primary-color); }
.option-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.option-dates { font-size: 0.7rem; color: var(--color-text-muted); }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease-out; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }

.btn-sprint-details { display: flex; align-items: center; gap: 0.5rem; background: var(--color-bg-card); border: 1.5px solid var(--color-border); color: var(--color-text-secondary); padding: 0.7rem 1.25rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-sprint-details:hover { background: var(--nav-active-bg, #F0FDF4); border-color: var(--primary-color); color: var(--primary-color); transform: translateY(-1px); }

.btn-create-sprint { display: flex; align-items: center; gap: 0.5rem; background: var(--primary-color); border: none; color: white; padding: 0.7rem 1.25rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-create-sprint:hover { filter: brightness(0.9); transform: translateY(-1px); }

.board-search-bar { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--color-text-muted); }
.board-search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; background: var(--color-bg-main); border: 1.5px solid var(--color-border); border-radius: 12px; font-size: 0.9rem; font-weight: 500; outline: none; transition: all 0.2s; color: var(--color-text-primary); }
.board-search-input:focus { background: var(--color-bg-card); border-color: var(--primary-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent); }

.btn-board-filter { display: flex; align-items: center; gap: 0.5rem; background: var(--color-bg-card); border: 1.5px solid var(--color-border); color: var(--color-text-secondary); padding: 0.7rem 1.25rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-board-filter:hover { background: var(--color-bg-main); }
.btn-board-filter.active { background: var(--nav-active-bg, #F0FDF4); border-color: var(--primary-color); color: var(--primary-color); }
.filter-count-badge { background: var(--color-danger); color: white; font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 50px; margin-left: 0.25rem; }

.board-content-area { flex: 1; overflow-x: auto; overflow-y: hidden; padding-bottom: 1rem; min-height: 0; display: flex; flex-direction: column; }
.board-layout { display: flex; gap: 1.5rem; align-items: stretch; justify-content: flex-start; padding-bottom: 0.5rem; flex: 1; min-height: 0; }
.board-layout.fit-to-screen { justify-content: stretch; }

.board-column { flex: 0 0 320px; min-width: 320px; max-width: 500px; background: var(--color-bg-main); border: 2px solid transparent; border-radius: 20px; display: flex; flex-direction: column; min-height: 0; transition: all 0.2s; }
.board-column.fit-column { flex: 1; max-width: none; min-width: 0; }
.board-column.drop-active { background: var(--color-bg-card); border-color: var(--primary-color); transform: scale(1.01); }
.column-header { padding: 1.25rem; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
.column-title-group { display: flex; align-items: center; gap: 0.75rem; }
.column-type-counts { display: flex; gap: 0.5rem; }
.type-count { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; opacity: 0.4; transition: all 0.2s; }
.type-count.active { opacity: 1; }
.type-count.story { background: #dcfce7; color: #16a34a; }
.type-count.task { background: #dbeafe; color: #2563eb; }
.type-count.bug { background: #fee2e2; color: #dc2626; }
.column-dot { width: 8px; height: 8px; border-radius: 50%; }
.column-dot.to-do { background: #94A3B8; }
.column-dot.in-progress { background: #3B82F6; }
.column-dot.completed { background: var(--primary-color); }
.column-name { margin: 0; font-size: 0.9rem; font-weight: 800; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.05em; flex: 1; }
.column-count { background: var(--color-border); color: var(--color-text-muted); font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.6rem; border-radius: 50px; }

.column-body { 
  padding: 0 1rem 1rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
  overflow-y: auto; 
  overflow-x: hidden;
  flex: 1; 
  min-height: 0; 
  width: 100%;
  box-sizing: border-box;
  padding-right: 14px;
}

.column-body::-webkit-scrollbar { width: 10px; }
.column-body::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 5px; }
.column-body::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 5px; border: 2px solid #e5e7eb; }
.column-body::-webkit-scrollbar-thumb:hover { background: #6b7280; }

.board-task-card { background: var(--color-bg-card); border-radius: 14px; display: flex; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; }
.board-task-card:hover { transform: translateY(-2px); border-color: var(--primary-color); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.task-card-accent { width: 4px; flex-shrink: 0; }
.task-card-accent.story { background: #10B981; }
.task-card-accent.task { background: var(--color-info); }
.task-card-accent.bug { background: var(--color-danger); }
.task-card-main { flex: 1; padding: 1rem; }
.task-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.type-icon-group { display: flex; align-items: center; gap: 0.5rem; }
.type-icon { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.type-icon.story { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.type-icon.task { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.type-icon.bug { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.task-uid { font-family: monospace; font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); }
.parent-link { font-family: monospace; font-size: 0.65rem; font-weight: 600; color: var(--primary-color); background: rgba(16, 185, 129, 0.1); padding: 0.1rem 0.35rem; border-radius: 3px; margin-left: 0.25rem; }
.task-card-meta-right { display: flex; align-items: center; gap: 0.5rem; }
.task-user-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.unassigned-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.task-title { margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); line-height: 1.4; }
.task-card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; }
.priority-indicator { display: flex; align-items: center; gap: 0.35rem; }
.priority-dot { width: 6px; height: 6px; border-radius: 50%; }
.priority-indicator.low .priority-dot { background: var(--color-success); }
.priority-indicator.medium .priority-dot { background: var(--color-warning); }
.priority-indicator.high .priority-dot { background: var(--color-danger); }
.priority-label { font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted); }
.story-points { display: flex; align-items: center; gap: 0.25rem; background: #FEF3C7; color: #D97706; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; }

.board-task-card.sub-item-card { background: var(--color-bg-card); border-left: 3px solid var(--primary-color); opacity: 0.85; transform: translateX(8px); width: calc(100% - 8px); }
.board-task-card.sub-item-card:hover { transform: translateX(8px) translateY(-2px); opacity: 1; }
.task-card-accent.sub-item-accent { width: 3px; background: var(--primary-color) !important; }

.add-task-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; border: 2px dashed var(--color-border); border-radius: 12px; background: transparent; color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.add-task-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: var(--nav-active-bg, #F0FDF4); }

.sub-items-section { margin-top: 0.5rem; border-top: 1px dashed var(--color-border); padding-top: 0.5rem; }
.sub-items-toggle { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-bg); border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); transition: all 0.2s; }
.sub-items-toggle:hover { background: var(--color-bg-card); color: var(--primary-color); }
.sub-items-toggle svg { transition: transform 0.2s; }
.sub-items-toggle svg.rotated { transform: rotate(-90deg); }
.sub-items-list { padding: 0.25rem 0; }
.sub-items-parent-header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 0.4rem 0.6rem; border-radius: 6px; margin: 0.5rem 0 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.parent-header-uid { color: var(--primary-color); flex-shrink: 0; }
.parent-header-type { color: var(--color-text-muted); font-weight: 600; flex-shrink: 0; }
.parent-header-title { color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.no-sprint-selected { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center; }
.empty-icon { color: var(--color-border); margin-bottom: 1rem; }
.no-sprint-selected h3 { margin: 0 0 0.5rem; color: var(--color-text-primary); font-size: 1.25rem; }
.no-sprint-selected p { margin: 0; color: var(--color-text-muted); }

/* Filter Sidebar */
.filter-sidebar { position: fixed; top: 0; right: 0; width: 320px; height: 100vh; background: var(--color-bg-card); border-left: 1px solid var(--color-border); box-shadow: -4px 0 20px rgba(0,0,0,0.1); z-index: 1000; display: flex; flex-direction: column; }
.filter-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--color-border-light); }
.filter-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.btn-clear-filters { background: none; border: none; color: var(--primary-color); font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-clear-filters:hover { text-decoration: underline; }
.filter-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
.filter-section { margin-bottom: 1.5rem; }
.filter-section label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
.filter-opt-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.filter-opt-row:hover { background: var(--color-bg-main); }
.opt-check { width: 18px; height: 18px; border: 2px solid var(--color-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.opt-check.checked { background: var(--primary-color); border-color: var(--primary-color); }
.filter-users-list { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; cursor: pointer; }
.filter-user-row:hover { background: var(--color-bg-main); }
.filter-user-avatar { width: 24px; height: 24px; border-radius: 50%; }
.opt-check.small { width: 14px; height: 14px; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.sprint-detail-modal { background: var(--color-bg-card); border-radius: 20px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--color-border-light); }
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
.btn-close { background: none; border: none; cursor: pointer; color: var(--color-text-muted); }
.modal-body { padding: 1.5rem; }
.detail-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border-light); }
.detail-row label { font-size: 0.85rem; color: var(--color-text-muted); }
.detail-row span { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.in-progress { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.status-badge.not-started { background: var(--color-border-light); color: var(--color-text-secondary); }
.status-badge.completed { background: var(--nav-active-bg, #F0FDF4); color: var(--primary-color); }
.modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-top: 1px solid var(--color-border-light); }
.modal-footer .footer-right { display: flex; gap: 1rem; }
.btn { padding: 0.75rem 1.5rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary { background: var(--color-bg-main); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn-secondary:hover { background: var(--color-border-light); }
.btn-primary { background: var(--primary-color); border: none; color: white; }
.btn-primary:hover { filter: brightness(0.9); }
.btn-danger { background: var(--color-danger); border: none; color: white; }
.btn-danger:hover { background: #DC2626; }

/* Board Sub Items */
.board-sub-items {
  margin-top: -0.5rem;
  padding-bottom: 0.5rem;
}

.sub-items-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.sub-items-toggle:hover {
  background: var(--color-bg-main);
  color: var(--primary-color);
}

.sub-items-toggle svg {
  transition: transform 0.2s;
}

.sub-items-toggle svg.rotated {
  transform: rotate(90deg);
}

.sub-items-count {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sub-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.sub-item-card {
  background: var(--color-bg-main) !important;
  border: 1px dashed var(--color-border) !important;
}

.sub-item-card:hover {
  border-color: var(--primary-color) !important;
}

.make-item-btn {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.make-item-btn:hover {
  background: var(--nav-active-bg, #F0FDF4);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.collapse-enter-active, .collapse-leave-active {
  transition: all 0.3s ease-out;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.collapse-enter-from, .collapse-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Sprint Modal - Using same styles as backlog */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }

.modal-container.sprint-modal { 
  background: var(--color-bg-card); 
  width: 100%; 
  max-width: 1300px; 
  margin: 0; 
  border-radius: 24px; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
  height: 90vh; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { transform: scale(0.95) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header { 
  padding: 1.5rem 3rem; 
  border-bottom: 1px solid var(--color-border-light); 
  background: var(--color-bg-card); 
  flex-shrink: 0;
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.modal-header h2 { 
  font-size: 1.85rem; 
  font-weight: 900; 
  color: var(--color-text-primary); 
  margin: 0;
  letter-spacing: -0.03em;
}

.modal-header .close-btn { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  background: var(--color-border-light); 
  border: none;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  transition: all 0.2s; 
}

.modal-header .close-btn:hover { 
  background: rgba(239, 68, 68, 0.1); 
  color: var(--color-danger); 
  transform: rotate(90deg); 
}

.modal-form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.scrollable-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.sticky-footer {
  padding: 1.5rem 3rem;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.form-main-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: start;
}

.form-column-left, .form-column-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-row { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1.5rem; 
}

.input-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.6rem; 
}

.input-group label { 
  font-size: 0.75rem; 
  font-weight: 700; 
  color: var(--color-text-secondary); 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
}

.input-group input, 
.input-group textarea, 
.input-group select { 
  padding: 0.85rem 1rem; 
  border: 1.5px solid var(--color-border); 
  border-radius: 12px; 
  font-size: 0.95rem; 
  outline: none; 
  background: var(--color-bg-main);
  color: var(--color-text-primary);
  transition: all 0.2s; 
}

.input-group input:focus, 
.input-group textarea:focus, 
.input-group select:focus { 
  border-color: var(--primary-color); 
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent); 
  background: var(--color-bg-card);
}

.textarea-input { 
  min-height: 100px; 
  resize: vertical; 
  font-family: inherit; 
}

.form-section-divider {
  height: 1.5px;
  background: var(--color-border-light);
  width: 100%;
}

.section-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.selection-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
}

.user-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.user-checkbox-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem; background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.user-checkbox-item:hover { border-color: var(--primary-color); transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.user-checkbox-item.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }

.checkbox-avatar { width: 40px; height: 40px; border-radius: 50%; }

.user-selection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.uname { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); }
.uemail { font-size: 0.7rem; color: var(--color-text-muted); margin-top: -0.1rem; }

.checkbox-indicator { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.user-checkbox-item.selected .checkbox-indicator { background: var(--primary-color); border-color: var(--primary-color); color: white; }

.btn-save { 
  background: var(--primary-color); 
  color: white; 
  border: none; 
  padding: 1rem 2.5rem; 
  border-radius: 14px; 
  font-weight: 700; 
  font-size: 1rem;
  cursor: pointer; 
  transition: background 0.2s; 
}

.btn-save:hover { filter: brightness(0.9); }

.btn-cancel { 
  background: var(--color-bg-main); 
  color: var(--color-text-secondary); 
  border: 1px solid var(--color-border); 
  padding: 1rem 2.5rem; 
  border-radius: 14px; 
  font-weight: 700; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.2s; 
}

.btn-cancel:hover { background: var(--color-border-light); color: var(--color-text-primary); }
</style>