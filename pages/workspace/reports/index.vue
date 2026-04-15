<template>
  <div class="reports-page" @click="closeDropdowns">
    <header class="page-header">
      <div class="header-titles">
        <h1>Reports</h1>
        <p>View and analyze project performance data.</p>
      </div>
    </header>

    <div class="filters-section" @click.stop>
      <div class="filter-row">
        <div class="filter-group">
          <label>Select Project</label>
          <div class="custom-select" @click="projectDropdownOpen = !projectDropdownOpen" :class="{ open: projectDropdownOpen }">
            <div class="select-trigger">
              <span v-if="selectedProjectId">{{ getProjectName(selectedProjectId) }}</span>
              <span v-else class="placeholder">All Projects</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="projectDropdownOpen" class="select-dropdown">
              <div class="select-option" @click.stop="selectedProjectId = null; projectDropdownOpen = false">
                <span>All Projects</span>
              </div>
              <div v-for="project in projects" :key="project.id" class="select-option" @click.stop="selectedProjectId = project.id; onProjectChange(); projectDropdownOpen = false">
                <span>{{ project.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>Select Sprint</label>
          <div class="custom-select" @click="sprintDropdownOpen = !sprintDropdownOpen" :class="{ open: sprintDropdownOpen, disabled: !selectedProjectId }">
            <div class="select-trigger">
              <span v-if="selectedSprintId">{{ getSprintName(selectedSprintId) }}</span>
              <span v-else class="placeholder">All Sprints</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="sprintDropdownOpen && selectedProjectId" class="select-dropdown">
              <div class="select-option" @click.stop="selectedSprintId = null; sprintDropdownOpen = false">
                <span>All Sprints</span>
              </div>
              <div v-for="sprint in filteredSprints" :key="sprint.id" class="select-option" @click.stop="selectedSprintId = sprint.id; sprintDropdownOpen = false">
                <span>{{ sprint.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>Start Date</label>
          <div class="custom-date-input" @click="startDateOpen = !startDateOpen">
            <div class="date-trigger">
              <span v-if="startDate">{{ startDate }}</span>
              <span v-else class="placeholder">Select date</span>
              <svg class="date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div v-if="startDateOpen" class="date-dropdown">
              <div class="date-header">
                <button @click.stop="prevMonth" class="nav-btn">&lt;</button>
                <span>{{ currentMonthName }} {{ currentYear }}</span>
                <button @click.stop="nextMonth" class="nav-btn">&gt;</button>
              </div>
              <div class="date-grid">
                <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
                <button v-for="(d, i) in calendarDays" :key="i" 
                  class="day" 
                  :class="{ 'other-month': d.otherMonth, 'selected': d.date === startDate, 'today': d.isToday }"
                  @click.stop="selectDate(d.date, 'start')">
                  {{ d.day }}
                </button>
              </div>
              <div class="date-actions">
                <button @click.stop="startDate = ''; startDateOpen = false" class="clear-btn">Clear</button>
                <button @click.stop="startDateOpen = false" class="close-btn">Close</button>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>End Date</label>
          <div class="custom-date-input" @click="endDateOpen = !endDateOpen">
            <div class="date-trigger">
              <span v-if="endDate">{{ endDate }}</span>
              <span v-else class="placeholder">Select date</span>
              <svg class="date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div v-if="endDateOpen" class="date-dropdown">
              <div class="date-header">
                <button @click.stop="prevMonthEnd" class="nav-btn">&lt;</button>
                <span>{{ currentMonthEndName }} {{ currentYearEnd }}</span>
                <button @click.stop="nextMonthEnd" class="nav-btn">&gt;</button>
              </div>
              <div class="date-grid">
                <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
                <button v-for="(d, i) in calendarDaysEnd" :key="i" 
                  class="day" 
                  :class="{ 'other-month': d.otherMonth, 'selected': d.date === endDate, 'today': d.isToday }"
                  @click.stop="selectDate(d.date, 'end')">
                  {{ d.day }}
                </button>
              </div>
              <div class="date-actions">
                <button @click.stop="endDate = ''; endDateOpen = false" class="clear-btn">Clear</button>
                <button @click.stop="endDateOpen = false" class="close-btn">Close</button>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-apply" @click="applyFilters" :disabled="loading">
          <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          <span>{{ loading ? 'Loading...' : 'Apply Filters' }}</span>
        </button>
      </div>
    </div>

    <div class="reports-content">
      <div v-if="!hasFilters" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>Select a project and date range to view reports</p>
      </div>

      <div v-else class="results-section">
        <div class="results-summary">
          <span class="results-count">{{ reportData.length }} records found</span>
        </div>
        
        <div v-if="reportData.length === 0" class="no-data">
          <p>No records found for the selected filters</p>
        </div>

        <div v-else class="results-table">
          <!-- Table content will go here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const projects = ref<any[]>([])
const sprints = ref<any[]>([])
const reportData = ref<any[]>([])

const selectedProjectId = ref<number | null>(null)
const selectedSprintId = ref<number | null>(null)
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const projectDropdownOpen = ref(false)
const sprintDropdownOpen = ref(false)
const startDateOpen = ref(false)
const endDateOpen = ref(false)

// Start Date calendar
const startDateCal = ref(new Date())
const currentMonthName = computed(() => startDateCal.value.toLocaleString('default', { month: 'long' }))
const currentYear = computed(() => startDateCal.value.getFullYear())

const prevMonth = () => {
  startDateCal.value = new Date(startDateCal.value.getFullYear(), startDateCal.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  startDateCal.value = new Date(startDateCal.value.getFullYear(), startDateCal.value.getMonth() + 1, 1)
}

const calendarDays = computed(() => {
  const year = startDateCal.value.getFullYear()
  const month = startDateCal.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month days
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ day: d.getDate(), otherMonth: true, date: formatDate(d), isToday: false })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ day: i, otherMonth: false, date: formatDate(d), isToday: d.getTime() === today.getTime() })
  }
  
  // Next month days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ day: i, otherMonth: true, date: formatDate(d), isToday: false })
  }
  
  return days
})

// End Date calendar
const endDateCal = ref(new Date())
const currentMonthEndName = computed(() => endDateCal.value.toLocaleString('default', { month: 'long' }))
const currentYearEnd = computed(() => endDateCal.value.getFullYear())

const prevMonthEnd = () => {
  endDateCal.value = new Date(endDateCal.value.getFullYear(), endDateCal.value.getMonth() - 1, 1)
}

const nextMonthEnd = () => {
  endDateCal.value = new Date(endDateCal.value.getFullYear(), endDateCal.value.getMonth() + 1, 1)
}

const calendarDaysEnd = computed(() => {
  const year = endDateCal.value.getFullYear()
  const month = endDateCal.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ day: d.getDate(), otherMonth: true, date: formatDate(d), isToday: false })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ day: i, otherMonth: false, date: formatDate(d), isToday: d.getTime() === today.getTime() })
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ day: i, otherMonth: true, date: formatDate(d), isToday: false })
  }
  
  return days
})

const formatDate = (d: Date) => {
  return d.toISOString().split('T')[0]
}

const selectDate = (date: string, type: 'start' | 'end') => {
  if (type === 'start') {
    startDate.value = date
    startDateOpen.value = false
  } else {
    endDate.value = date
    endDateOpen.value = false
  }
}

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const getProjectName = (id: number) => {
  const project = projects.value.find(p => p.id === id)
  return project?.name || ''
}

const getSprintName = (id: number) => {
  const sprint = sprints.value.find(s => s.id === id)
  return sprint?.name || ''
}

const closeDropdowns = () => {
  projectDropdownOpen.value = false
  sprintDropdownOpen.value = false
}

const filteredSprints = computed(() => {
  if (!selectedProjectId.value) return []
  return sprints.value.filter(s => s.projectId === selectedProjectId.value)
})

const hasFilters = computed(() => {
  return selectedProjectId.value || selectedSprintId.value || startDate.value || endDate.value
})

onMounted(async () => {
  const [projectsData, sprintsData] = await Promise.all([
    $fetch('/api/projects'),
    $fetch('/api/sprints')
  ])
  projects.value = projectsData
  sprints.value = sprintsData
})

const onProjectChange = () => {
  selectedSprintId.value = null
}

const applyFilters = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedProjectId.value) params.append('projectId', selectedProjectId.value.toString())
    if (selectedSprintId.value) params.append('sprintId', selectedSprintId.value.toString())
    if (startDate.value) params.append('startDate', startDate.value)
    if (endDate.value) params.append('endDate', endDate.value)

    const data = await $fetch(`/api/reports?${params.toString()}`)
    reportData.value = data
  } catch (e) {
    console.error('Failed to fetch report data', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reports-page {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1rem;
}

.header-titles h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.header-titles p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.filters-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  display: none;
}

.custom-select {
  position: relative;
  cursor: pointer;
}

.custom-select.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 600;
  transition: all 0.2s;
}

.custom-select:hover:not(.disabled) .select-trigger {
  border-color: var(--primary-color);
}

.custom-select.open .select-trigger {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-color-alpha);
}

.select-trigger .placeholder {
  color: var(--color-text-muted);
}

.select-trigger .chevron {
  transition: transform 0.2s;
  color: var(--color-text-muted);
}

.custom-select.open .chevron {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.select-option {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: all 0.15s;
}

.select-option:hover {
  background: var(--color-bg-main);
  color: var(--primary-color);
}

/* Custom Date Input */
.custom-date-input {
  position: relative;
}

.date-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 600;
  outline: none;
  transition: all 0.2s;
}

.date-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-color-alpha);
}

.date-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

/* Custom Date Picker */
.custom-date-input {
  position: relative;
  cursor: pointer;
}

.date-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 600;
  transition: all 0.2s;
}

.custom-date-input:hover .date-trigger {
  border-color: var(--primary-color);
}

.date-trigger .placeholder {
  color: var(--color-text-muted);
}

.date-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
  z-index: 100;
  padding: 1rem;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.nav-btn:hover {
  background: var(--color-bg-main);
  color: var(--primary-color);
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-align: center;
  padding: 0.5rem;
}

.day {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  color: var(--color-text-primary);
  transition: all 0.15s;
}

.day:hover {
  background: var(--color-bg-main);
  color: var(--primary-color);
}

.day.other-month {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.day.today {
  background: var(--primary-color-alpha);
  color: var(--primary-color);
}

.day.selected {
  background: var(--primary-color);
  color: white;
}

.date-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-light);
}

.clear-btn, .close-btn {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
}

.clear-btn:hover {
  color: var(--color-danger);
}

.close-btn {
  background: var(--primary-color);
  border: none;
  color: white;
}

.close-btn:hover {
  filter: brightness(1.1);
}

.select-chevron {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.btn-apply {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 46px;
}

.btn-apply:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-apply:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reports-content {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  font-weight: 500;
}

.results-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 1.5rem;
}

.results-summary {
  margin-bottom: 1rem;
}

.results-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
