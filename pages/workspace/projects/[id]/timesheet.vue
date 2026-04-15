<template>
  <div class="ts-page">
    <!-- Header Controls -->
    <div class="ts-header-flex">
      <div class="ts-header-left">
        <h1 class="ts-page-title">Timesheet</h1>
      </div>
      
      <div class="ts-header-right">
        <!-- Searchbar -->
        <div class="ts-search-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchQuery" placeholder="Search logs..." class="ts-search-input" />
        </div>

        <button class="ts-filter-btn" @click="filterSidebarOpen = true" :class="{ 'has-filters': activeFilterCount > 0 }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span v-if="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</span>
          <span>Filters</span>
        </button>
      </div>
    </div>



    <!-- Timesheet Table Area -->
    <div class="ts-table-container">
      <table class="ts-table">
        <thead>
          <tr>
            <th style="width: 12%;">Date</th>
            <th style="width: 18%;">Owner</th>
            <th style="width: 25%;">Task</th>
            <th style="width: 35%;">Log Description</th>
            <th style="width: 16%; text-align: right;">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="empty-row">
            <td colspan="5">Loading timesheet data...</td>
          </tr>
          <tr v-else-if="filteredLogs.length === 0" class="empty-row">
            <td colspan="5">No time logs match the selected filters.</td>
          </tr>
          <tr v-else v-for="(log, idx) in filteredLogs" :key="log.uid + '-' + log.id + '-' + idx" tabindex="0">
            <td class="td-date">{{ formatDate(log.date) }}</td>
            <td>
              <div class="td-user">
                <img :src="getUserPhoto(log.userId)" class="td-avatar" />
                <span class="td-user-name">{{ getUserName(log.userId) }}</span>
              </div>
              <span class="td-uid" @click="navigateToItem(log.item.id)">{{ log.item.uid }}</span>
            </td>
            <td>
              <div class="td-task">
                <div class="td-task-top">
                  <span class="td-title">{{ log.item.title }}</span>
                </div>
                <div class="td-task-meta">
                  <span class="td-type-badge" :class="log.item.type?.toLowerCase()">{{ log.item.type }}</span>
                  <div v-if="log.item.sprintId" class="td-sprint-badge">{{ getSprintName(log.item.sprintId) }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="td-desc">{{ log.description || 'No description provided.' }}</div>
            </td>
            <td style="text-align: right;">
              <span class="td-duration">{{ formatHoursToHHMM(log.hours) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Filter Sidebar Overlay -->
    <transition name="slide-panel">
      <div v-if="filterSidebarOpen" class="item-panel-overlay" @click.self="filterSidebarOpen = false">
        <div class="filter-panel">
          <div class="fp-header">
             <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary);">Filter Timesheet</h3>
             <button class="fp-close-btn" @click="filterSidebarOpen = false">&times;</button>
          </div>
          <div class="fp-body">
             <div class="filter-section">
                <label class="filter-label">Member</label>
                <div class="filter-options-stack">
                   <div class="filter-opt-row" :class="{ active: selectedMembers.length === 0 }" @click="selectedMembers = []">
                      <div class="opt-check" :class="{ checked: selectedMembers.length === 0 }">
                         <svg v-if="selectedMembers.length === 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">All Members</span>
                   </div>
                   <div v-for="user in usersList" :key="user.id" class="filter-opt-row" :class="{ active: selectedMembers.includes(user.id) }" @click="toggleMemberFilter(user.id)">
                      <div class="opt-check" :class="{ checked: selectedMembers.includes(user.id) }">
                         <svg v-if="selectedMembers.includes(user.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                         <img :src="getUserPhoto(user.id)" style="width:24px; height:24px; border-radius:50%; object-fit: cover; border: 1px solid var(--color-border-light);" />
                         <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">{{ user.name }}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div class="filter-section">
                <label class="filter-label">Sprint</label>
                <div class="filter-options-stack">
                   <div class="filter-opt-row" :class="{ active: selectedSprints.length === 0 }" @click="selectedSprints = []">
                      <div class="opt-check" :class="{ checked: selectedSprints.length === 0 }">
                         <svg v-if="selectedSprints.length === 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">All Sprints</span>
                   </div>
                   <div v-for="s in sprintList" :key="s.id" class="filter-opt-row" :class="{ active: selectedSprints.includes(s.id) }" @click="toggleSprintFilter(s.id)">
                      <div class="opt-check" :class="{ checked: selectedSprints.includes(s.id) }">
                         <svg v-if="selectedSprints.includes(s.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">{{ s.name }}</span>
                   </div>
                </div>
             </div>

             <div class="filter-section">
                <label class="filter-label">Item Type</label>
                <div class="filter-options-stack">
                   <div class="filter-opt-row" :class="{ active: selectedTypes.length === 0 }" @click="selectedTypes = []">
                      <div class="opt-check" :class="{ checked: selectedTypes.length === 0 }">
                         <svg v-if="selectedTypes.length === 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">All Types</span>
                   </div>
                   <div v-for="t in ['Story', 'Task', 'Bug']" :key="t" class="filter-opt-row" :class="{ active: selectedTypes.includes(t) }" @click="toggleTypeFilter(t)">
                      <div class="opt-check" :class="{ checked: selectedTypes.includes(t) }">
                         <svg v-if="selectedTypes.includes(t)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary);">{{ t }}</span>
                   </div>
                </div>
             </div>
          </div>
          <div class="fp-footer">
             <button class="btn-secondary-thematic" style="width: 100%;" @click="clearFilters">Clear All Filters</button>
             <button class="btn-primary-thematic" style="width: 100%;" @click="filterSidebarOpen = false">Apply Filters</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const loading = ref(true)
const projectName = ref('Project')
const projectItems = ref<any[]>([])
const sprintList = ref<any[]>([])
const usersList = ref<any[]>([])

const searchQuery = ref('')
const selectedSprints = ref<number[]>([])
const selectedMembers = ref<number[]>([])
const selectedTypes = ref<string[]>([])
const filterSidebarOpen = ref(false)

const activeFilterCount = computed(() => {
  return selectedSprints.value.length + selectedMembers.value.length + selectedTypes.value.length
})

const clearFilters = () => {
  selectedSprints.value = []
  selectedMembers.value = []
  selectedTypes.value = []
  searchQuery.value = ''
}

const getUserName = (id: number) => {
  const u = usersList.value.find(u => u.id === id)
  return u ? u.name : `User #${id}`
}
const getUserPhoto = (id: number) => {
  const u = usersList.value.find(u => u.id === id)
  if (u?.profile_photo) return u.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=10B981&color=fff`
}

const getSprintName = (id: number) => {
  const s = sprintList.value.find(s => s.id === id)
  return s ? s.name : 'Unknown Sprint'
}

const toggleSprintFilter = (id: number) => {
  const idx = selectedSprints.value.indexOf(id)
  if (idx > -1) selectedSprints.value.splice(idx, 1)
  else selectedSprints.value.push(id)
}

const toggleMemberFilter = (id: number) => {
  const idx = selectedMembers.value.indexOf(id)
  if (idx > -1) selectedMembers.value.splice(idx, 1)
  else selectedMembers.value.push(id)
}

const toggleTypeFilter = (type: string) => {
  const idx = selectedTypes.value.indexOf(type)
  if (idx > -1) selectedTypes.value.splice(idx, 1)
  else selectedTypes.value.push(type)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatHoursToHHMM = (decimalHours: number | string) => {
  const hNum = Number(decimalHours) || 0
  const hh = Math.floor(hNum)
  const mm = Math.round((hNum - hh) * 60)
  return `${hh.toString().padStart(2, '0')}h ${mm.toString().padStart(2, '0')}m`
}

const navigateToItem = (itemId: number) => {
  router.push(`/workspace/projects/${projectId}/items/${itemId}`)
}

// Fetch all required data in parallel
onMounted(async () => {
  try {
    const [projData, itemsData, sprintsData, usersData] = await Promise.all([
      $fetch(`/api/projects?id=${projectId}`) as Promise<any>,
      $fetch(`/api/items?projectId=${projectId}`) as Promise<any>,
      $fetch(`/api/sprints?projectId=${projectId}`) as Promise<any>,
      $fetch(`/api/users`) as Promise<any>
    ])
    
    // /api/projects?id=X returns the project object directly
    if (projData?.id) {
      projectName.value = projData.name || 'Project'
    }
    // /api/sprints?projectId=X returns a plain array
    if (Array.isArray(sprintsData)) {
      sprintList.value = sprintsData
    }
    // /api/items?projectId=X returns a plain array
    if (Array.isArray(itemsData)) {
      projectItems.value = itemsData
    }
    // /api/users returns a plain array
    if (Array.isArray(usersData)) {
      usersList.value = usersData
    }
  } catch (error) {
    console.error('Failed to load timesheet data:', error)
  } finally {
    loading.value = false
  }
})

// Extract and flat map all logs from all items
const allTimeLogs = computed(() => {
  let logs: any[] = []
  projectItems.value.forEach(item => {
    if (item.timeLogs && item.timeLogs.length > 0) {
      item.timeLogs.forEach((log: any) => {
        logs.push({
          ...log,
          item: {
            id: item.id,
            uid: item.uid,
            title: item.title,
            type: item.type,
            sprintId: item.sprintId
          }
        })
      })
    }
  })
  // Sort by date descending
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Apply search and filters
const filteredLogs = computed(() => {
  return allTimeLogs.value.filter(log => {
    // Sprint Filter
    if (selectedSprints.value.length > 0 && !selectedSprints.value.includes(log.item.sprintId)) {
      return false
    }
    // Member Filter
    if (selectedMembers.value.length > 0 && !selectedMembers.value.includes(log.userId)) {
      return false
    }
    // Type Filter
    if (selectedTypes.value.length > 0 && !selectedTypes.value.includes(log.item.type)) {
      return false
    }
    // Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const titleMatch = log.item.title?.toLowerCase().includes(q)
      const uidMatch = log.item.uid?.toLowerCase().includes(q)
      const descMatch = log.description?.toLowerCase().includes(q)
      if (!titleMatch && !uidMatch && !descMatch) return false
    }
    return true
  })
})

const totalFilteredHours = computed(() => {
  return filteredLogs.value.reduce((acc, log) => acc + Number(log.hours || 0), 0)
})

const closeDropdowns = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.custom-dropdown-alt')) {
    sprintDropdownOpen.value = false
    memberDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
})
</script>

<style scoped>
.ts-page {
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
  background: var(--color-bg-card);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.ts-page-title { font-size: 1.85rem; font-weight: 850; color: var(--color-text-primary); margin: 0; letter-spacing: -0.03em; }
.ts-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }

.ts-header-right { display: flex; align-items: center; gap: 1rem; }

/* Search Area */
.ts-search-wrap { position: relative; width: 260px; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
.ts-search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1.5px solid var(--color-border); border-radius: 12px; font-size: 0.9rem; outline: none; transition: 0.2s; background: var(--color-bg-card); color: var(--color-text-primary); box-sizing: border-box; }
.ts-search-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent); }



/* Table Container */
.ts-table-container { background: var(--color-bg-card); border-radius: 16px; border: 1px solid var(--color-border); box-shadow: 0 10px 30px rgba(0,0,0,0.03); overflow: hidden; }
.ts-table { width: 100%; border-collapse: collapse; text-align: left; }
.ts-table th { padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-bg-subtle); }
.ts-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border-light); vertical-align: middle; transition: background 0.2s; }
.ts-table tbody tr:hover td { background: var(--color-bg-main); cursor: default; }

.empty-row td { text-align: center; padding: 3rem; color: var(--color-text-muted); font-size: 0.95rem; font-style: italic; }

.td-date { font-weight: 700; color: var(--color-text-secondary); font-size: 0.95rem; }

.td-user { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--color-bg-main); padding: 0.35rem 1rem 0.35rem 0.35rem; border-radius: 99px; }
.td-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid var(--color-bg-card); object-fit: cover; }
.td-user-name { font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); }
.td-uid { display: block; font-family: monospace; font-size: 0.7rem; font-weight: 800; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 10%, transparent); padding: 0.1rem 0.35rem; border-radius: 4px; cursor: pointer; transition: 0.2s; margin-top: 0.25rem; width: fit-content; }
.td-uid:hover { background: color-mix(in srgb, var(--primary-color) 20%, transparent); }

.td-task { display: flex; flex-direction: column; gap: 0.3rem; }
.td-task-top { display: flex; align-items: center; gap: 0.5rem; }
.td-task-meta { display: flex; align-items: center; gap: 0.5rem; }
.td-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }

.td-type-badge { font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 99px; text-transform: uppercase; }
.td-type-badge.story { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.td-type-badge.task { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.td-type-badge.bug { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

.td-sprint-badge { font-size: 0.65rem; font-weight: 800; background: var(--color-bg-main); color: var(--color-text-muted); padding: 0.15rem 0.5rem; border-radius: 99px; text-transform: uppercase; }

.td-desc { flex: 1; font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.5; font-style: italic; background: var(--color-bg-main); padding: 0.75rem 1rem; border-radius: 8px; border-left: 2px solid var(--color-border); }

.td-duration { display: inline-block; white-space: nowrap; font-size: 1rem; font-weight: 800; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 10%, transparent); padding: 0.4rem 0.75rem; border-radius: 8px; font-family: monospace; }

/* Filter Slide Panel Override Items */
.ts-filter-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: 0.2s; border: 1.5px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); position: relative; }
.ts-filter-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.ts-filter-btn.has-filters { border-color: var(--color-text-primary); background: var(--color-text-primary); color: var(--color-bg-card); }
.filter-count { background: var(--color-danger); color: white; font-size: 0.65rem; font-weight: 800; border-radius: 99px; padding: 0.1rem 0.4rem; position: absolute; top: -5px; right: -5px; }

/* Filter Panel Overlay */
.item-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); backdrop-filter: blur(2px); z-index: 500; }
.filter-panel { position: absolute; right: 0; top: 0; bottom: 0; width: 400px; max-width: 90vw; background: var(--color-bg-card); display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.12); border-left: 1px solid var(--color-border); }
.fp-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1.75rem; border-bottom: 1.5px solid var(--color-border-light); }
.fp-close-btn { background: var(--color-bg-main); border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; color: var(--color-text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.fp-close-btn:hover { background: var(--color-danger); color: white; }
.fp-body { flex: 1; overflow-y: auto; padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 2.25rem; }
.filter-section { display: flex; flex-direction: column; gap: 1rem; }
.filter-label { font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.filter-options-stack { display: flex; flex-direction: column; gap: 0.65rem; }
.filter-opt-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem; background: var(--color-bg-main); border: 1.5px solid var(--color-border); border-radius: 12px; cursor: pointer; transition: 0.2s; }
.filter-opt-row:hover { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.filter-opt-row.active { background: color-mix(in srgb, var(--primary-color) 12%, transparent); border-color: var(--primary-color); }
.opt-check { width: 18px; height: 18px; border-radius: 6px; border: 2px solid var(--color-border); background: var(--color-bg-card); display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.opt-check.checked { background: var(--primary-color); border-color: var(--primary-color); }
.fp-footer { padding: 1.5rem 1.75rem; border-top: 1.5px solid var(--color-border-light); background: var(--color-bg-main); display: flex; gap: 1rem; }

.btn-primary-thematic { background: var(--color-text-primary); color: var(--color-bg-card); border: none; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-primary-thematic:hover { background: var(--primary-color); color: white; }
.btn-secondary-thematic { background: var(--color-border); color: var(--color-text-secondary); border: none; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-secondary-thematic:hover { background: var(--color-text-light); }

.slide-panel-enter-active, .slide-panel-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-panel-enter-from .filter-panel, .slide-panel-leave-to .filter-panel { transform: translateX(100%); }
.slide-panel-enter-from { opacity: 0; }
.slide-panel-leave-to { opacity: 0; }
</style>
