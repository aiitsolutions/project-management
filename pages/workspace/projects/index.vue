<template>
  <div class="dashboard-content" :style="{ '--primary-color': primaryColor }">
    <div class="dashboard-header-row">
      <div class="dashboard-titles">
        <h1>Projects</h1>
        <p>Manage and organize all your team initiatives.</p>
      </div>
      <div class="header-actions-right">
        <button class="btn-primary" @click="showModal = true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M8 3V13M3 8H13"/>
          </svg>
          Add Project
        </button>
      </div>
    </div>

        <div class="projects-container">
          <!-- CARD VIEW -->
          <div class="projects-grid">
            <div v-if="loading" class="empty-state">Loading projects...</div>
            <div v-else-if="projects.length === 0" class="empty-state">No projects found. Add one!</div>
            
            <div 
              class="project-card" 
              v-for="project in projects" 
              :key="project.id" 
              @click="navigateToProject(project.id)"
              v-else
            >
              <!-- Colored accent bar -->
              <div class="card-accent-bar"></div>

              <!-- Card body -->
              <div class="card-body">
                <!-- Header row: logo + status badge -->
                <div class="card-header-row">
                  <div class="card-logo-wrap">
                    <img v-if="project.logo_url" :src="project.logo_url" class="project-logo" alt="logo" />
                    <div v-else class="project-logo-fallback">{{ (project.prefix || 'P').substring(0,2).toUpperCase() }}</div>
                  </div>
                  <span class="status-badge" :class="getStatusClass(project.status)">{{ project.status }}</span>
                </div>

                <!-- Title + prefix tag -->
                <div class="card-title-row">
                  <h3 class="card-project-name">{{ project.name }}</h3>
                  <span class="prefix-pill">{{ project.prefix }}</span>
                </div>

                <!-- Description -->
                <div class="project-desc" v-html="truncate(project.description)"></div>

                <!-- Footer meta -->
                <div class="card-footer-meta">
                  <div class="meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{{ getOwnerName(project.owner_id) }}</span>
                  </div>
                  <div class="meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{{ formatDate(project.start_date || '') }}</span>
                  </div>
                </div>

                <!-- Sprint Stats -->
                <div class="sprint-stats">
                  <div class="sprint-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <span>{{ getSprintCount(project.id) }} Sprints</span>
                  </div>
                  <div class="completion-circle" :style="{ '--pct': getSprintCompletion(project.id) + '%' }">
                    <span>{{ getSprintCompletion(project.id) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Project' : 'New Project' }}</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveProject" class="modal-form">
          
          <div class="form-grid-top">
            <!-- Left Header: Project Logo -->
            <div class="logo-upload-container">
              <label>Project Icon</label>
              <div class="logo-upload-area">
                <label class="logo-upload-label" :class="{ 'has-image': form.logo_url }">
                  <input type="file" @change="handleLogoUpload" accept="image/*" class="hidden-file-input" />
                  <template v-if="form.logo_url">
                    <img :src="form.logo_url" alt="preview" class="logo-circle-preview" />
                    <div class="logo-overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                  </template>
                  <template v-else-if="uploadingLogo">
                     <div class="loading-spinner"></div>
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>Upload</span>
                    </div>
                  </template>
                </label>
                <div class="logo-actions" v-if="form.logo_url">
                   <button type="button" @click="form.logo_url = ''" class="btn-remove-logo">Remove</button>
                </div>
              </div>
            </div>

            <!-- Right Header: Core Information -->
            <div class="core-details-grid">
              <div class="input-group span-2">
                <label>Project Name</label>
                <input type="text" v-model="form.name" required placeholder="e.g. Website Redesign" />
              </div>
              
              <div class="input-group">
                <label>Project Prefix</label>
                <input type="text" v-model="form.prefix" required placeholder="e.g. WEB" maxlength="5" />
              </div>

              <div class="input-group span-2 custom-dropdown-container">
                <label>Project Owner</label>
                <div class="custom-select-trigger" @click="toggleDropdown('owner')" :class="{'focus-ring': activeDropdown === 'owner'}">
                  <span v-if="form.owner_id">{{ getOwnerName(form.owner_id) }}</span>
                  <span v-else class="text-gray">Choose an owner...</span>
                </div>
                
                <div class="custom-dropdown-panel" v-if="activeDropdown === 'owner'">
                  <div class="search-wrap-dropdown">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" v-model="ownerSearch" placeholder="Search owners..." @click.stop />
                  </div>
                  <div class="dropdown-options">
                    <div class="dropdown-option" 
                         v-for="user in filteredUsers" 
                         :key="user.id"
                         @click="selectOwner(user.id)"
                         :class="{ 'selected': form.owner_id === user.id }">
                      <span class="currency-name">{{ user.name }}</span>
                      <span class="currency-symbol">{{ user.email }}</span>
                    </div>
                    <div v-if="filteredUsers.length === 0" class="no-results">No owners found</div>
                  </div>
                </div>
              </div>

              <div class="input-group custom-dropdown-container">
                <label>Project Status</label>
                <div class="custom-select-trigger" @click="toggleDropdown('status')" :class="{'focus-ring': activeDropdown === 'status'}">
                  <span v-if="form.status">{{ form.status }}</span>
                  <span v-else class="text-gray">Select Status...</span>
                </div>
                
                <div class="custom-dropdown-panel" v-if="activeDropdown === 'status'">
                  <div class="search-wrap-dropdown">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" v-model="statusSearch" placeholder="Search status..." @click.stop />
                  </div>
                  <div class="dropdown-options">
                    <div class="dropdown-option" 
                         v-for="status in filteredStatuses" 
                         :key="status"
                         @click="selectStatus(status)"
                         :class="{ 'selected': form.status === status }">
                      <span class="currency-name">{{ status }}</span>
                    </div>
                    <div v-if="filteredStatuses.length === 0" class="no-results">No status found</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="input-group mt-1">
            <label>Project Description</label>
            <RichTextEditor v-model="form.description" />
          </div>

          <div class="form-grid-bottom mt-1">
            <div class="input-group custom-dropdown-container">
              <label>Start Date</label>
              <div class="custom-select-trigger" @click.stop="toggleDatePicker('start')" :class="{'focus-ring': activeDatePicker === 'start'}">
                <span v-if="form.start_date">{{ formatDate(form.start_date || '') }}</span>
                <span v-else class="text-gray">Select Start Date...</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="cal-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="custom-dropdown-panel date-picker-panel" v-if="activeDatePicker === 'start'" @click.stop>
                 <div class="calendar-header">
                   <button type="button" @click="prevMonth">←</button>
                   <span class="font-bold">{{ monthNames[currentCalMonth] }} {{ currentCalYear }}</span>
                   <button type="button" @click="nextMonth">→</button>
                 </div>
                 <div class="calendar-grid">
                    <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
                    <div v-for="(day, idx) in calendarDays" :key="idx" class="cal-day" :class="{'empty': day.empty, 'selected': day.fullDate === form.start_date}" @click="day.empty ? null : selectDate(day.fullDate)">
                       {{ day.empty ? '' : day.date }}
                    </div>
                 </div>
              </div>
            </div>

            <div class="input-group custom-dropdown-container">
              <label>End Date</label>
              <div class="custom-select-trigger" @click.stop="toggleDatePicker('end')" :class="{'focus-ring': activeDatePicker === 'end'}">
                <span v-if="form.end_date">{{ formatDate(form.end_date || '') }}</span>
                <span v-else class="text-gray">Select End Date...</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="cal-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="custom-dropdown-panel date-picker-panel" v-if="activeDatePicker === 'end'" @click.stop>
                 <div class="calendar-header">
                   <button type="button" @click="prevMonth">←</button>
                   <span class="font-bold">{{ monthNames[currentCalMonth] }} {{ currentCalYear }}</span>
                   <button type="button" @click="nextMonth">→</button>
                 </div>
                 <div class="calendar-grid">
                    <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
                    <div v-for="(day, idx) in calendarDays" :key="idx" class="cal-day" :class="{'empty': day.empty, 'selected': day.fullDate === form.end_date}" @click="day.empty ? null : selectDate(day.fullDate)">
                       {{ day.empty ? '' : day.date }}
                    </div>
                 </div>
              </div>
            </div>
            <div class="input-group custom-dropdown-container">
              <label>Billing Currency</label>
              <div class="custom-select-trigger" @click="toggleDropdown('currency')" :class="{'focus-ring': activeDropdown === 'currency'}">
                <span v-if="form.currency">{{ form.currency }}</span>
                <span v-else class="text-gray">Select Currency...</span>
              </div>
              
              <div class="custom-dropdown-panel" v-if="activeDropdown === 'currency'">
                <div class="search-wrap-dropdown">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" v-model="currencySearch" placeholder="Search currencies..." @click.stop />
                </div>
                <div class="dropdown-options">
                  <div class="dropdown-option" 
                       v-for="currency in filteredCurrencies" 
                       :key="currency.code"
                       @click="selectCurrency(currency.code)"
                       :class="{ 'selected': form.currency === currency.code }">
                    <span class="currency-code">{{ currency.code }}</span>
                    <span class="currency-name">{{ currency.name }}</span>
                    <span class="currency-symbol">{{ currency.symbol }}</span>
                  </div>
                  <div v-if="filteredCurrencies.length === 0" class="no-results">No currencies found</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Project' }}
            </button>
          </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface User {
  id: string | number;
  name: string;
  email: string;
}

interface Project {
  id: string | number;
  name: string;
  description: string;
  logo_url: string;
  owner_id: string | number;
  prefix: string;
  start_date: string;
  end_date: string;
  status: string;
  currency: string;
}

const { user } = useAuth()
const { settings: appSettings } = useSettings()
const primaryColor = ref(appSettings.value.colorScheme || '#10B981')

const fetchPrimaryColor = async () => {
  try {
    const data = await $fetch<any>('/api/settings')
    if (data?.colorScheme) primaryColor.value = data.colorScheme
  } catch (e) {
    console.error('Failed to fetch primary color', e)
  }
}

const projects = ref<Project[]>([])
const sprintsMap = ref(new Map<number, any[]>())
const itemsMap = ref(new Map<number, any[]>())

const getSprintCount = (projectId: number) => {
  return sprintsMap.value.get(projectId)?.length || 0
}

const getSprintCompletion = (projectId: number) => {
  const sprints = sprintsMap.value.get(projectId) || []
  if (sprints.length === 0) return 0
  
  let totalItems = 0
  let doneItems = 0
  
  sprints.forEach(sprint => {
    const items = itemsMap.value.get(sprint.id) || []
    const isCompletedSprint = sprint.status === 'Completed' || sprint.status === 'Completed '
    totalItems += items.length
    if (isCompletedSprint) {
      doneItems += items.length
    } else {
      doneItems += items.filter((i: any) => {
        const s = i.status?.toLowerCase() || ''
        return s === 'done' || s === 'completed'
      }).length
    }
  })
  
  if (totalItems === 0) return 0
  return Math.round((doneItems / totalItems) * 100)
}
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editorRef = ref<HTMLElement | null>(null)

const uploadingLogo = ref(false)
const activeDropdown = ref<string | null>(null)
const ownerSearch = ref('')
const statusSearch = ref('')
const currencySearch = ref('')

const toggleDropdown = (name: string) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = name
  }
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' }
]

const filteredUsers = computed(() => {
  const query = ownerSearch.value.toLowerCase()
  return users.value.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
})

const statuses = ['Not Started', 'In Progress', 'On Hold', 'Completed']
const filteredStatuses = computed(() => {
  const query = statusSearch.value.toLowerCase()
  return statuses.filter(s => s.toLowerCase().includes(query))
})

const filteredCurrencies = computed(() => {
  const query = currencySearch.value.toLowerCase()
  return currencies.filter(c => 
    c.code.toLowerCase().includes(query) || 
    c.name.toLowerCase().includes(query)
  )
})

const selectOwner = (id: string | number) => {
  form.value.owner_id = id
  activeDropdown.value = null
  ownerSearch.value = ''
}

const selectStatus = (status: string) => {
  form.value.status = status
  activeDropdown.value = null
  statusSearch.value = ''
}

const selectCurrency = (code: string) => {
  form.value.currency = code
  activeDropdown.value = null
  currencySearch.value = ''
}

const activeDatePicker = ref<'start' | 'end' | null>(null)
const currentCalMonth = ref(new Date().getMonth())
const currentCalYear = ref(new Date().getFullYear())
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const calendarDays = computed(() => {
  const daysInMonth = new Date(currentCalYear.value, currentCalMonth.value + 1, 0).getDate()
  const firstDay = new Date(currentCalYear.value, currentCalMonth.value, 1).getDay()
  
  const days = []
  for(let i = 0; i < firstDay; i++) {
    days.push({ empty: true })
  }
  for(let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      empty: false, 
      date: i, 
      fullDate: `${currentCalYear.value}-${String(currentCalMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }
  return days
})

const prevMonth = () => {
  if (currentCalMonth.value === 0) {
    currentCalMonth.value = 11
    currentCalYear.value--
  } else {
    currentCalMonth.value--
  }
}

const nextMonth = () => {
  if (currentCalMonth.value === 11) {
    currentCalMonth.value = 0
    currentCalYear.value++
  } else {
    currentCalMonth.value++
  }
}

const selectDate = (dateStr: string) => {
  if (activeDatePicker.value === 'start') {
    form.value.start_date = dateStr
  } else if (activeDatePicker.value === 'end') {
    form.value.end_date = dateStr
  }
  activeDatePicker.value = null
}

const toggleDatePicker = (type: 'start' | 'end') => {
  activeDropdown.value = null
  if (activeDatePicker.value === type) {
    activeDatePicker.value = null
  } else {
    activeDatePicker.value = type
    const existingDate = type === 'start' ? (form.value.start_date || '') : (form.value.end_date || '')
    if (existingDate) {
      const parts = existingDate.split('-')
      if (parts.length === 3) {
        currentCalYear.value = parseInt(parts[0], 10)
        currentCalMonth.value = parseInt(parts[1], 10) - 1
      }
    } else {
      currentCalMonth.value = new Date().getMonth()
      currentCalYear.value = new Date().getFullYear()
    }
  }
}

const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.custom-dropdown-container')) {
    activeDropdown.value = null
    activeDatePicker.value = null
  }
}

const handleLogoUpload = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    form.value.logo_url = (response as any).url
  } catch (error) {
    console.error('Logo upload failed:', error)
    alert('Failed to upload logo.')
  } finally {
    uploadingLogo.value = false
  }
}

const defaultForm: any = {
  id: null,
  name: '',
  description: '',
  logo_url: '',
  owner_id: '',
  prefix: '',
  start_date: '',
  end_date: '',
  status: 'Not Started',
  currency: 'USD'
}

const form = ref<Project>({ ...defaultForm })

const fetchProjects = async () => {
  loading.value = true
  try {
    const [projectsData, sprintsData, itemsData] = await Promise.all([
      $fetch<Project[]>('/api/projects'),
      $fetch('/api/sprints'),
      $fetch('/api/items')
    ])
    
    projects.value = projectsData
    
    // Group sprints by projectId
    const sprintsByProject = new Map<number, any[]>()
    ;(sprintsData as any[]).forEach((sprint: any) => {
      if (!sprintsByProject.has(sprint.projectId)) {
        sprintsByProject.set(sprint.projectId, [])
      }
      sprintsByProject.get(sprint.projectId)?.push(sprint)
    })
    sprintsMap.value = sprintsByProject
    
    // Group items by sprintId
    const itemsBySprint = new Map<number, any[]>()
    ;(itemsData as any[]).forEach((item: any) => {
      if (item.sprintId) {
        if (!itemsBySprint.has(item.sprintId)) {
          itemsBySprint.set(item.sprintId, [])
        }
        itemsBySprint.get(item.sprintId)?.push(item)
      }
    })
    itemsMap.value = itemsBySprint
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const data = await $fetch<User[]>('/api/users')
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

onMounted(() => {
  fetchPrimaryColor()
  fetchProjects()
  fetchUsers()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const getOwnerName = (ownerId: string | number) => {
  const owner = users.value.find(u => u.id === ownerId)
  return owner ? owner.name : 'Unknown'
}

const formatText = (command: string) => {
  document.execCommand(command, false, '')
}

const updateDescription = () => {
  if (editorRef.value) {
    form.value.description = editorRef.value.innerHTML
  }
}

watch(showModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = form.value.description
      }
    })
  }
})

const closeModal = () => {
  showModal.value = false
  form.value = { ...defaultForm }
  isEditing.value = false
}

const editProject = (project: Project) => {
  form.value = { ...project }
  isEditing.value = true
  showModal.value = true
}

const { addToast } = useToast()

const saveProject = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await $fetch(`/api/projects?id=${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      addToast('Project Updated Successfully', 'success')
    } else {
      await $fetch('/api/projects', {
        method: 'POST',
        body: form.value
      })
      addToast('New Project Created', 'success')
    }
    await fetchProjects()
    closeModal()
  } catch (error) {
    addToast('Failed to save project', 'error')
  } finally {
    saving.value = false
  }
}

const deleteProject = async (id: string | number) => {
  if (!confirm('Are you sure you want to permanently delete this project?')) return
  try {
    await $fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    addToast('Project Deleted Permanently', 'success')
    await fetchProjects()
  } catch (error) {
    addToast('Failed to delete project', 'error')
  }
}

const navigateToProject = (id: string | number) => {
  navigateTo(`/workspace/projects/${id}`)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Completed': return 'status-completed'
    case 'In Progress': return 'status-progress'
    case 'On Hold': return 'status-hold'
    case 'Not Started': return 'status-not-started'
    default: return ''
  }
}

const truncate = (html: string) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = doc.body.textContent || ''
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  return dateString
}
</script>

<style scoped>
/* Projects Specific Styles */
.dashboard-content { flex: 1; display: flex; flex-direction: column; }
.dashboard-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
.dashboard-titles h1 { font-size: 1.75rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 0.5rem 0; }
.dashboard-titles p { color: var(--color-text-muted); font-size: 0.9rem; margin: 0; }

.header-actions-right { display: flex; align-items: center; gap: 1rem; }
.view-toggle { display: flex; background: var(--color-bg-card); padding: 0.25rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.view-toggle button { display: flex; align-items: center; gap: 0.4rem; background: transparent; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
.view-toggle button.active { background: var(--color-border-light); color: var(--color-text-primary); font-weight: 600; }
.btn-primary { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

/* Projects Specific Styles */
.projects-container { flex: 1; }

/* Shared badges / typography */
.badge.gray { background: var(--color-border-light); color: var(--color-text-secondary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.status-badge { padding: 0.3rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
.status-completed { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.status-progress { background: #FFFBEB; color: #F59E0B; }
.status-pending { background: #FEF2F2; color: #EF4444; }
.status-hold { background: var(--color-bg-subtle); color: var(--color-text-muted); }

/* Grid / Card View Styles */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.project-card {
  background: var(--color-bg-card);
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-decoration: none !important;
  color: inherit;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.project-card * { text-decoration: none !important; }

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.08);
  border-color: var(--primary-color);
}

/* Colored top accent bar */
.card-accent-bar {
  height: 4px;
  background: var(--primary-color);
  width: 100%;
  flex-shrink: 0;
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0;
}

/* Header: logo on left, status badge on right */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.1rem;
}

.card-logo-wrap {
  flex-shrink: 0;
}

.project-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.project-logo-fallback {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Title + prefix row */
.card-title-row {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.card-project-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.prefix-pill {
  font-size: 0.68rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--color-text-muted);
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 0.1rem 0.45rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Description */
.project-card .project-desc {
  font-size: 0.83rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
  margin-bottom: 1.25rem;
  flex: 1;
}

/* Footer meta */
.card-footer-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.sprint-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-light);
}

.sprint-count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.sprint-count svg {
  color: var(--primary-color);
}

.completion-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: conic-gradient(var(--primary-color) var(--pct), var(--color-border-light) var(--pct));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.completion-circle::before {
  content: '';
  position: absolute;
  width: 28px;
  height: 28px;
  background: var(--color-bg-card);
  border-radius: 50%;
}

.completion-circle span {
  position: relative;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.meta-chip svg {
  color: var(--color-text-light);
  flex-shrink: 0;
}

.empty-state { text-align: center; padding: 2rem; color: var(--color-text-muted); font-size: 0.9rem; grid-column: 1 / -1; }

.file-upload-group { display: flex; flex-direction: column; gap: 0.5rem; }
.file-input-wrapper { display: flex; align-items: center; gap: 1.25rem; }
.hidden-file-input { display: none; }
.logo-upload-label { position: relative; width: 75px; height: 75px; border-radius: 50%; border: 2px dashed var(--color-border); display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; transition: all 0.2s; background: var(--color-bg-subtle); flex-shrink: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.logo-upload-label:hover { border-color: var(--primary-color); background: var(--color-bg-subtle); }
.logo-upload-label.has-image { border-style: solid; border-color: var(--color-border); border-width: 1px; }
.logo-circle-preview { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.upload-placeholder span { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.logo-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
.logo-upload-label:hover .logo-overlay { opacity: 1; }
.btn-remove-logo { background: #FEF2F2; border: 1px solid #FECACA; color: #EF4444; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.4rem 0.75rem; border-radius: 8px; }
.btn-remove-logo:hover { background: #FEE2E2; border-color: #F87171; }
.logo-actions { display: flex; flex-direction: column; gap: 0.25rem; }
.loading-spinner { width: 20px; height: 20px; border: 3px solid var(--color-border); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(17, 24, 39, 0.4); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
.modal-container { background: var(--color-bg-card); width: 100%; max-width: 900px; border-radius: 20px; overflow: visible; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0;} to { transform: translateY(0); opacity: 1; } }

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary); }
.close-btn { background: transparent; border: none; font-size: 1.25rem; color: var(--color-text-muted); cursor: pointer; transition: color 0.1s;}
.close-btn:hover { color: var(--color-text-primary); }
.modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; background: var(--color-bg-card); }
.text-gray { color: var(--color-text-muted); }
.font-bold { font-weight: 700; color: var(--color-text-primary); }
.upload-icon { color: var(--color-text-muted); }
.search-icon { color: var(--color-text-muted); flex-shrink: 0; }
.cal-icon { color: var(--color-text-muted); flex-shrink: 0; }

/* Premium Grid Form Layout */
.form-grid-top { display: grid; grid-template-columns: 140px 1fr; gap: 2rem; align-items: start; }
.logo-upload-container { display: flex; flex-direction: column; gap: 0.5rem; }
.logo-upload-container label { font-size: 0.8rem; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
.logo-upload-area { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--color-bg-subtle); padding: 1.25rem 1rem; border-radius: 12px; border: 1px dashed var(--color-border); transition: border-color 0.2s; }

.core-details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
.span-2 { grid-column: span 2; }

.form-grid-bottom { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; background: var(--color-bg-subtle); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--color-border-light); }

.input-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; position: relative; }
.input-group label { font-size: 0.8rem; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em; }

/* Global Styling for form inputs */
.input-group input, .input-group select { 
  padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.95rem; color: var(--color-text-primary); outline: none; transition: all 0.2s; background: var(--color-bg-card); box-shadow: 0 1px 2px rgba(0,0,0,0.02); 
}
.input-group input:focus, .input-group select:focus, .focus-ring { border-color: var(--primary-color) !important; box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent) !important; }
.input-group input::placeholder { color: var(--color-text-muted); }

/* Customizing Date Pickers & Standard Selects */
.input-group select, .input-group input[type="date"] {
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px;
  padding-right: 2.5rem;
  cursor: pointer;
}
.input-group input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0; width: 100%; height: 100%; position: absolute; top: 0; left: 0; cursor: pointer;
}

/* Date Picker Panel Styles */
.date-picker-panel { padding: 1.25rem; width: 280px; z-index: 201; }
.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.calendar-header span { font-size: 0.95rem; color: var(--color-text-primary); }
.calendar-header button { background: var(--color-bg-subtle); border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-text-muted); width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.calendar-header button:hover { background: var(--color-border); color: var(--color-text-primary); }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }
.cal-day-name { text-align: center; font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); padding-bottom: 0.5rem; }
.cal-day { display: flex; align-items: center; justify-content: center; height: 32px; border-radius: 8px; font-size: 0.85rem; color: var(--color-text-secondary); cursor: pointer; transition: all 0.15s; font-weight: 500; }
.cal-day:not(.empty):hover { background: var(--color-bg-subtle); }
.cal-day.selected { background: var(--primary-color) !important; color: white !important; font-weight: 600; box-shadow: 0 4px 10px color-mix(in srgb, var(--primary-color) 30%, transparent); }

/* Custom Dropdown Overrides */
.custom-dropdown-container { position: relative; }
.custom-select-trigger { padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.95rem; color: var(--color-text-primary); background: var(--color-bg-card); cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 16px; padding-right: 2.5rem; }
.custom-dropdown-panel { position: absolute; top: auto; bottom: calc(100% + 4px); left: 0; width: 100%; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); z-index: 201; overflow: hidden; animation: fadeIn 0.15s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.search-wrap-dropdown { display: flex; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border); gap: 0.75rem; background: var(--color-bg-subtle); }
.search-wrap-dropdown input { width: 100%; border: none; outline: none; font-size: 0.95rem; font-weight: 500; color: var(--color-text-primary); background: transparent; padding: 0 !important; box-shadow: none !important; }
.search-wrap-dropdown input::placeholder { color: var(--color-text-muted); font-weight: 400; }
.dropdown-options { max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; }
.dropdown-option { display: flex; align-items: center; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s; gap: 0.75rem; }
.dropdown-option:hover { background: var(--color-bg-subtle); }
.dropdown-option.selected { background: color-mix(in srgb, var(--primary-color) 10%, transparent); }
.currency-code { font-weight: 700; color: var(--color-text-primary); font-size: 0.85rem; width: 35px; }
.currency-name { color: var(--color-text-secondary); font-size: 0.85rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.currency-symbol { color: var(--color-text-muted); font-weight: 600; font-size: 0.85rem; }
.no-results { padding: 1.5rem; text-align: center; color: var(--color-text-muted); font-size: 0.85rem; }

.mt-1 { margin-top: 0.5rem; }

.rich-text-editor { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; background: var(--color-bg-card); box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.rich-text-editor:focus-within { border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent); }
.editor-toolbar { background: var(--color-bg-subtle); border-bottom: 1px solid var(--color-border-light); padding: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap; align-items: center; }
.editor-toolbar button { background: transparent; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; color: var(--color-text-secondary); transition: background 0.2s;}
.editor-toolbar button:hover { background: var(--color-border); }
.toolbar-divider { width: 1px; height: 16px; background: var(--color-border); margin: 0 0.25rem; }
.editor-content { padding: 1rem; min-height: 120px; outline: none; font-size: 0.9rem; color: var(--color-text-primary); max-height: 200px; overflow-y: auto; }

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border-light); }
</style>
