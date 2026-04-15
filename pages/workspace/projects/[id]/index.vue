<template>
  <div class="project-info-container" :key="route.params.id">
    <!-- Skeleton View -->
    <template v-if="loading">
       <div class="info-view-grid">
         <div class="info-content-main">
           <div class="info-header-block">
              <SkeletonLoader width="90px" height="90px" radius="24px" />
              <div class="info-titles" style="flex:1">
                 <div class="info-prefix-row">
                    <SkeletonLoader width="60px" height="20px" />
                    <SkeletonLoader width="80px" height="20px" />
                 </div>
                 <SkeletonLoader width="60%" height="32px" class="mt-1" />
              </div>
           </div>
           <div class="info-section-card mt-3">
              <SkeletonLoader width="140px" height="14px" class="mb-2" />
              <SkeletonLoader width="100%" height="150px" />
           </div>
         </div>
         <div class="info-sidebar">
            <div class="action-bar-top">
               <SkeletonLoader width="100%" height="44px" radius="12px" />
               <SkeletonLoader width="44px" height="44px" radius="12px" />
            </div>
            <div class="stats-panel-integrated mt-2">
               <div v-for="i in 3" :key="i" class="stat-item-row">
                  <SkeletonLoader width="100px" height="12px" class="mb-1" />
                  <SkeletonLoader width="100%" height="30px" />
               </div>
            </div>
         </div>
       </div>
    </template>

    <!-- Read-Only View (Default) -->
    <template v-else-if="!isEditing">
      <div class="info-view-grid">
        <!-- Main Column: Identity & Description -->
        <div class="info-content-main">
          <div class="info-header-block">
             <div class="info-avatar-large">
                <img v-if="form.logo_url" :src="form.logo_url" alt="logo" />
                <div v-else class="avatar-ph">{{ form.prefix?.substring(0,2) || 'PR' }}</div>
             </div>
             <div class="info-titles">
                <div class="info-prefix-row">
                   <span class="prefix-tag">{{ form.prefix }}</span>
                   <span class="status-indicator" :class="getStatusClass(form.status)">{{ form.status }}</span>
                </div>
                <h1 class="info-name">{{ form.name }}</h1>
             </div>
          </div>

          <div class="info-section-card mt-3">
             <h4 class="section-subtitle">PROJECT DESCRIPTION</h4>
             <div class="description-viewer" v-html="form.description || '<p>No description provided.</p>'"></div>
          </div>
        </div>

        <!-- Side Column: Metrics & Parameters -->
        <div class="info-sidebar">
          <div class="action-bar-top">
             <button @click="isEditing = true" class="btn-edit-details">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit Details
             </button>
              <button @click="deleteProject" class="btn btn-danger icon-only" title="Delete Project">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
          </div>

          <div class="stats-panel-integrated mt-2">
             <div class="stat-item-row">
                <label>PROJECT OWNER</label>
                <div class="owner-pill">
                   <div class="owner-av-mini">{{ getOwnerName(form.owner_id).charAt(0) }}</div>
                   <span>{{ getOwnerName(form.owner_id) }}</span>
                </div>
             </div>
             <div class="stat-item-row">
                <label>BILLING CURRENCY</label>
                <div class="currency-display-mini">
                   <span class="curr-val">{{ form.currency }}</span>
                   <span class="curr-name">{{ getCurrencyName(form.currency) }}</span>
                </div>
             </div>
             <div class="stat-item-row">
                <label>PROJECT TIMELINE</label>
                <div class="timeline-visual-card">
                   <div class="date-pair">
                      <div class="date-box">
                         <span class="d-lab">START</span>
                         <span class="d-val">{{ formatShortMonth(form.start_date) }}</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      <div class="date-box">
                         <span class="d-lab">END</span>
                         <span class="d-val">{{ formatShortMonth(form.end_date) }}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Editing Mode -->
    <template v-else>
      <div class="edit-mode-container">
        <div class="edit-header">
           <div class="edit-title-wrap">
              <h2 class="edit-main-heading">Project Modification</h2>
              <p class="edit-subtext">Update core identity, timeline and security parameters.</p>
           </div>
            <div class="edit-actions">
               <button @click="isEditing = false" class="btn btn-secondary">Discard</button>
               <button @click="saveProject" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Apply Changes' }}
               </button>
            </div>
        </div>

        <form class="edit-form-premium mt-3" @submit.prevent="saveProject">
           <div class="form-grid-premium">
              <div class="form-avatar-col">
                 <label class="icon-upload-premium" :class="{'has-img': form.logo_url}">
                    <input type="file" @change="handleLogoUpload" accept="image/*" class="hidden-input" />
                    <img v-if="form.logo_url" :src="form.logo_url" alt="logo" />
                    <div v-else class="upload-vocal">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                       <span>Upload</span>
                    </div>
                 </label>
                 <button v-if="form.logo_url" type="button" @click="form.logo_url = ''" class="btn-remove-p">Remove</button>
              </div>

              <div class="form-fields-col">
                 <div class="premium-input-group full">
                    <label>PROJECT LEGAL NAME</label>
                    <input type="text" v-model="form.name" required placeholder="Enter formal project title..." />
                 </div>
                 
                 <div class="grid-2-col mt-2">
                    <div class="premium-input-group">
                       <label>SYSTEM PREFIX</label>
                       <input type="text" v-model="form.prefix" maxlength="5" placeholder="e.g. PRJ" />
                    </div>
                    <div class="premium-input-group dropdown-rel">
                       <label>MANAGEMENT STATUS</label>
                       <div class="premium-select" @click.stop="toggleDropdown('status')">
                          <span>{{ form.status }}</span>
                          <div class="premium-dropdown-panel" v-if="activeDropdown === 'status'">
                             <div v-for="s in statuses" :key="s" @click="selectStatus(s)" class="p-drop-opt" :class="{active: form.status === s}">{{ s }}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div class="grid-2-col mt-2">
                    <div class="premium-input-group dropdown-rel">
                       <label>ASSIGNED OWNER</label>
                       <div class="premium-select" @click.stop="toggleDropdown('owner')">
                          <span>{{ getOwnerName(form.owner_id) }}</span>
                          <div class="premium-dropdown-panel" v-if="activeDropdown === 'owner'">
                             <div class="p-search-box"><input type="text" v-model="ownerSearch" placeholder="Search team members..." @click.stop /></div>
                             <div class="p-drop-scroll">
                                <div v-for="u in filteredUsers" :key="u.id" @click="selectOwner(u.id)" class="p-drop-opt" :class="{active: form.owner_id === u.id}">
                                   <div class="u-opt-name">{{ u.name }}</div>
                                   <div class="u-opt-mail">{{ u.email }}</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div class="premium-input-group dropdown-rel">
                       <label>FINANCIAL CURRENCY</label>
                       <div class="premium-select" @click.stop="toggleDropdown('currency')">
                          <span>{{ form.currency }}</span>
                          <div class="premium-dropdown-panel" v-if="activeDropdown === 'currency'">
                             <div v-for="c in currencies" :key="c.code" @click="selectCurrency(c.code)" class="p-drop-opt" :class="{active: form.currency === c.code}">{{ c.code }} - {{ c.name }}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div class="premium-input-group mt-2 dropdown-rel">
                    <label>OPERATIONAL WINDOW (START — FINISH)</label>
                    <div class="premium-select" @click.stop="toggleDatePicker('start')">
                       <span>{{ formatLongDate(form.start_date) }} — {{ formatLongDate(form.end_date) }}</span>
                       <div class="p-calendar-panel" v-if="activeDatePicker !== null" @click.stop>
                          <div class="p-cal-h">
                             <button type="button" @click="prevMonth">←</button>
                             <span>{{ monthNames[currentCalMonth] }} {{ currentCalYear }}</span>
                             <button type="button" @click="nextMonth">→</button>
                          </div>
                          <div class="p-cal-g">
                             <div v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="p-cal-dn">{{d}}</div>
                             <div v-for="(day, idx) in calendarDays" :key="idx" class="p-cal-d" :class="{empty: day.empty, sel: day.fullDate === form.start_date || day.fullDate === form.end_date}" @click="day.empty ? null : selectDate(day.fullDate)">{{ day.date }}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                  <div class="premium-input-group mt-2">
                     <label>SUMMARY & PROJECT SCOPE</label>
                     <RichTextEditor v-model="form.description" />
                  </div>
              </div>
            </div>
          </form>
        </div>
      </template>

    <!-- Custom Delete Warning Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="delete-modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal-card">
           <div class="delete-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
           </div>
           <h2 class="delete-modal-title">Delete Project?</h2>
           <p class="delete-modal-text">
             Are you sure you want to delete <strong>{{ form.name }}</strong>? This action is permanent and will immediately remove all associated sprints, items, and technical data.
           </p>
            <div class="delete-modal-actions">
               <button class="btn btn-secondary" @click="showDeleteModal = false">No, Keep Project</button>
               <button class="btn btn-danger" @click="executeDelete" :disabled="saving">
                 {{ saving ? 'Deleting...' : 'Yes, Delete Project' }}
               </button>
            </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()

const { data: projectData, pending: loading, refresh: fetchData } = useAsyncData(
  `project-${route.params.id}`,
  () => $fetch<any>(`/api/projects?id=${route.params.id}`),
  { immediate: false }
)

const { data: usersData } = useAsyncData(
  'users',
  () => $fetch<any[]>('/api/users'),
  { immediate: false }
)

const users = ref<any[]>([])
const saving = ref(false)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const uploadingLogo = ref(false)
const activeDropdown = ref<string | null>(null)
const activeDatePicker = ref<'start' | 'end' | null>(null)
const ownerSearch = ref('')
const editorRef = ref<HTMLElement | null>(null)

watch(projectData, (newData) => {
  if (newData && newData.id) {
    Object.assign(form.value, newData)
  }
}, { immediate: true })

watch(usersData, (newData) => {
  if (newData) {
    users.value = newData
  }
})

const form = ref({
  id: '',
  name: '',
  description: '',
  logo_url: '',
  owner_id: '' as string | number,
  prefix: '',
  start_date: '',
  end_date: '',
  status: 'Not Started',
  currency: 'USD'
})

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

const getCurrencyName = (code: string) => currencies.find(c => c.code === code)?.name || 'Currency'

const statuses = ['Not Started', 'In Progress', 'On Hold', 'Completed']

const filteredUsers = computed(() => {
  const query = ownerSearch.value.toLowerCase()
  return users.value.filter(u => u.name.toLowerCase().includes(query))
})

const toggleDropdown = (name: string) => { activeDropdown.value = activeDropdown.value === name ? null : name; activeDatePicker.value = null; }
const selectOwner = (id: any) => { form.value.owner_id = id; activeDropdown.value = null; }
const selectStatus = (s: string) => { form.value.status = s; activeDropdown.value = null; }
const selectCurrency = (code: string) => { form.value.currency = code; activeDropdown.value = null; }

const getOwnerName = (id: any) => {
  const u = users.value.find(u => u.id === id)
  return u ? u.name : 'Choose Team Member'
}

const currentCalMonth = ref(new Date().getMonth())
const currentCalYear = ref(new Date().getFullYear())
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const calendarDays = computed(() => {
  const dim = new Date(currentCalYear.value, currentCalMonth.value + 1, 0).getDate()
  const fd = new Date(currentCalYear.value, currentCalMonth.value, 1).getDay()
  const days = []
  for(let i=0; i<fd; i++) days.push({ empty: true })
  for(let i=1; i<=dim; i++) {
    days.push({ empty: false, date: i, fullDate: `${currentCalYear.value}-${String(currentCalMonth.value+1).padStart(2,'0')}-${String(i).padStart(2,'0')}` })
  }
  return days
})

const prevMonth = () => { if(currentCalMonth.value === 0) { currentCalMonth.value = 11; currentCalYear.value--; } else currentCalMonth.value--; }
const nextMonth = () => { if(currentCalMonth.value === 11) { currentCalMonth.value = 0; currentCalYear.value++; } else currentCalMonth.value++; }
const toggleDatePicker = (t: any) => { activeDatePicker.value = activeDatePicker.value ? null : 'start'; activeDropdown.value = null; }
const selectDate = (d: string) => { 
  if(!form.value.start_date || (form.value.start_date && form.value.end_date)) {
    form.value.start_date = d; form.value.end_date = '';
  } else {
    form.value.end_date = d; activeDatePicker.value = null;
  }
}

const formatText = (cmd: string) => { document.execCommand(cmd, false); }
const updateDescription = () => { form.value.description = editorRef.value?.innerHTML || '' }

const handleLogoUpload = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingLogo.value = true
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await $fetch<any>('/api/upload', { method: 'POST', body: formData })
    form.value.logo_url = res.url
  } catch(e) {} finally { uploadingLogo.value = false }
}

onMounted(async () => {
  // Wait a bit to ensure route is ready
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Reset form before fetching
  form.value = {
    id: '',
    name: '',
    description: '',
    logo_url: '',
    owner_id: '' as string | number,
    prefix: '',
    start_date: '',
    end_date: '',
    status: 'Not Started',
    currency: 'USD'
  }
  users.value = []
  
  await fetchData()
  await usersData.value?.execute?.()
  
  // Update form with project data after refresh
  await nextTick()
  if (projectData.value && projectData.value.id) {
    Object.assign(form.value, projectData.value)
    setTimeout(() => {
      if (editorRef.value) editorRef.value.innerHTML = form.value.description || '<p>No project description.</p>'
    }, 100)
  }
  
  window.addEventListener('click', () => { activeDropdown.value = null; activeDatePicker.value = null; })
})

watch(() => route.params.id, async (newId) => {
  if (!newId) return
  
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Reset form
  form.value = {
    id: '',
    name: '',
    description: '',
    logo_url: '',
    owner_id: '' as string | number,
    prefix: '',
    start_date: '',
    end_date: '',
    status: 'Not Started',
    currency: 'USD'
  }
  users.value = []
  
  await fetchData()
  await usersData.value?.execute?.()
  
  await nextTick()
  if (projectData.value && projectData.value.id) {
    Object.assign(form.value, projectData.value)
    setTimeout(() => {
      if (editorRef.value) editorRef.value.innerHTML = form.value.description || '<p>No project description.</p>'
    }, 100)
  }
})

const { addToast } = useToast()

const saveProject = async () => {
  saving.value = true
  try {
    await $fetch(`/api/projects?id=${route.params.id}`, { method: 'PUT', body: form.value })
    addToast('Project Changes Applied Successfully', 'success')
    isEditing.value = false
  } catch(e) {
    addToast('Failed to save project changes', 'error')
  } finally {
    saving.value = false
  }
}

const deleteProject = () => {
  showDeleteModal.value = true
}

const executeDelete = async () => {
  saving.value = true
  try {
    await $fetch(`/api/projects?id=${route.params.id}`, { method: 'DELETE' })
    addToast('Project Deleted Permanently', 'success')
    navigateTo('/workspace/projects')
  } catch(e) {
    addToast('Failed to delete project', 'error')
    showDeleteModal.value = false
  } finally {
    saving.value = false
  }
}

const formatLongDate = (ds: string) => {
  if(!ds) return 'Select Date'
  const p = ds.split('-')
  return p.length === 3 ? new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2])).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : ds
}

const formatShortMonth = (ds: string) => {
  if(!ds) return '...'
  const p = ds.split('-')
  if(p.length === 3) return new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2])).toLocaleDateString('en-US', {month:'short', year:'numeric'})
  return ds
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

onBeforeMount(async () => {
  await nextTick()
  fetchData()
  window.addEventListener('click', () => { activeDropdown.value = null; activeDatePicker.value = null; })
})

onNuxtReady(() => {
  if (route.params.id) {
    fetchData()
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchData()
  }
})
</script>

<style scoped>
/* LIGHT BLACK (SOFT CHARCOAL) FOR HEADINGS: #374151 */

.project-info-container { padding: 3rem; background: var(--color-bg-card); min-height: 80vh; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
.info-view-grid { display: grid; grid-template-columns: 1fr 320px; gap: 4rem; }

.info-header-block { display: flex; gap: 2rem; align-items: center; border-bottom: 2px solid var(--color-border-light); padding-bottom: 2.5rem; }
.info-avatar-large { width: 90px; height: 90px; border-radius: 24px; background: var(--color-bg-main); border: 1px solid var(--color-border-light); overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.info-avatar-large img { width: 100%; height: 100%; object-fit: cover; }
.info-avatar-large .avatar-ph { font-size: 2rem; font-weight: 600; color: var(--primary-color); }

.info-prefix-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem; }
.prefix-tag { background: var(--color-text-muted); color: var(--color-bg-card); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; font-family: monospace; }
.status-indicator { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; padding: 0.2rem 0.75rem; border-radius: 99px; letter-spacing: 0.05em; }
.info-name { font-size: 1.4rem; font-weight: 600; color: var(--color-text-secondary); margin: 0; letter-spacing: -0.01em; } 

.status-completed { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: #065F46; }.status-progress { background: #DBEAFE; color: #1E40AF; }
.status-hold { background: #FEF3C7; color: #92400E; }
.status-not-started { background: var(--color-bg-subtle); color: var(--color-text-secondary); }

.section-subtitle { font-size: 0.7rem; font-weight: 600; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 1.5rem; border-left: 3px solid var(--primary-color); padding-left: 1rem; }
.description-viewer { font-size: 1.05rem; line-height: 1.8; color: var(--color-text-secondary); }

.btn-edit-details { flex: 1; background: var(--color-text-secondary); color: var(--color-bg-card); border: none; padding: 0.8rem; border-radius: 12px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.btn-edit-details:hover { transform: translateY(-2px); background: var(--color-text-primary); }

.action-bar-top { display: flex; gap: 1rem; }

.stats-panel-integrated { background: var(--color-bg-main); border-radius: 20px; padding: 2rem; border: 1px solid var(--color-border-light); }
.stat-item-row { margin-bottom: 2rem; }
.stat-item-row:last-child { margin-bottom: 0; }
.stat-item-row label { font-size: 0.65rem; font-weight: 500; color: var(--color-text-light); display: block; margin-bottom: 0.75rem; letter-spacing: 0.05em; }

.owner-pill { display: flex; align-items: center; gap: 0.8rem; font-weight: 600; color: var(--color-text-secondary); font-size: 0.95rem; }
.owner-av-mini { width: 28px; height: 28px; border-radius: 8px; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
.curr-val { font-size: 1.1rem; font-weight: 600; color: var(--color-text-secondary); display: block; }
.curr-name { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; }

.date-pair { display: flex; align-items: center; justify-content: space-between; }
.date-box { display: flex; flex-direction: column; gap: 0.3rem; }
.d-lab { font-size: 0.6rem; font-weight: 800; color: var(--color-border); }
.d-val { font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary); }

/* EDIT MODE PREMIUM STYLING */
.edit-mode-container { max-width: 900px; }
.edit-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--color-border-light); padding-bottom: 2rem; margin-bottom: 3rem; }
.edit-main-heading { font-size: 1.75rem; font-weight: 800; color: var(--color-text-secondary); margin: 0; } /* LIGHT BLACK HEADING */
.edit-subtext { font-size: 0.9rem; color: var(--color-text-muted); margin: 0.5rem 0 0 0; font-weight: 500; }

.edit-actions { display: flex; gap: 1rem; }

.form-grid-premium { display: flex; gap: 4rem; }
.form-avatar-col { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.icon-upload-premium { width: 110px; height: 110px; border-radius: 30px; border: 2px dashed var(--color-border); background: var(--color-bg-main); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; overflow: hidden; position: relative; }
.icon-upload-premium.has-img { border-style: solid; border-color: var(--color-border-light); background: white; }
.icon-upload-premium:hover { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.icon-upload-premium img { width: 100%; height: 100%; object-fit: contain; padding: 0.5rem; }
.hidden-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.upload-vocal { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; color: var(--color-text-light); }
.upload-vocal span { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.btn-remove-p { background: none; border: none; color: var(--color-danger); font-size: 0.7rem; font-weight: 800; cursor: pointer; text-transform: uppercase; }

.form-fields-col { flex: 1; }
.premium-input-group { display: flex; flex-direction: column; gap: 0.6rem; }
.premium-input-group label { font-size: 0.7rem; font-weight: 800; color: var(--color-text-light); letter-spacing: 0.05em; }
.premium-input-group input { padding: 0.85rem 1.15rem; border: 1px solid var(--color-border); border-radius: 12px; font-size: 0.95rem; font-weight: 500; color: var(--color-text-secondary); background: var(--color-bg-card); transition: all 0.2s; }
.premium-input-group input:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 10%, transparent); }

.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.mt-2 { margin-top: 1.5rem; }
.mt-3 { margin-top: 3rem; }

.premium-select { padding: 0.85rem 1.15rem; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); font-size: 0.95rem; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; position: relative; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
.premium-select:hover { border-color: var(--color-border); }

.premium-dropdown-panel { position: absolute; top: 105%; left: 0; right: 0; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 14px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); z-index: 200; overflow: hidden; }
.p-search-box { padding: 0.75rem; border-bottom: 1px solid var(--color-border-light); }
.p-search-box input { width: 100%; border: 1px solid var(--color-border-light); background: var(--color-bg-main); padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.85rem; color: var(--color-text-primary); }
.p-drop-opt { padding: 0.8rem 1.25rem; font-size: 0.9rem; cursor: pointer; transition: all 0.1s; }
.p-drop-opt:hover { background: var(--color-bg-main); color: var(--primary-color); }
.p-drop-opt.active { background: var(--primary-color); color: white; }
.p-drop-scroll { max-height: 250px; overflow-y: auto; }
.u-opt-name { font-weight: 700; color: var(--color-text-primary); }
.u-opt-mail { font-size: 0.75rem; opacity: 0.7; margin-top: 0.1rem; color: var(--color-text-muted); }

.p-calendar-panel { position: absolute; top: 105%; right: 0; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 18px; padding: 1.5rem; box-shadow: 0 15px 50px rgba(0,0,0,0.15); z-index: 200; width: 300px; }
.p-cal-h { display: flex; justify-content: space-between; align-items: center; font-size: 1rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--color-text-secondary); }
.p-cal-h button { background: var(--color-border-light); border: none; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; color: var(--color-text-muted); }
.p-cal-g { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.p-cal-dn { text-align: center; font-size: 0.7rem; font-weight: 800; color: var(--color-text-light); text-transform: uppercase; padding-bottom: 1rem; }
.p-cal-d { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: 10px; transition: all 0.1s; color: var(--color-text-primary); }
.p-cal-d:hover:not(.empty) { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); }
.p-cal-d.sel { background: var(--primary-color); color: white; }

.p-rich-editor { border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden; background: var(--color-bg-card); }
.p-editor-h { padding: 0.75rem; background: var(--color-bg-main); border-bottom: 1px solid var(--color-border); display: flex; gap: 0.6rem; }
.p-editor-h button { padding: 0.4rem 0.8rem; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 8px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: all 0.1s; color: var(--color-text-secondary); }
.p-editor-h button:hover { background: var(--color-bg-main); border-color: var(--color-border); }
.p-editor-area { min-height: 250px; padding: 1.5rem; font-size: 1rem; line-height: 1.8; color: var(--color-text-secondary); }
.p-editor-area:focus { outline: none; }

/* CUSTOM DELETE MODAL */
.delete-modal-overlay { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.delete-modal-card { background: var(--color-bg-card); width: 100%; max-width: 480px; border-radius: 28px; padding: 2.5rem; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
.delete-icon-circle { width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: var(--color-danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; }
.delete-modal-title { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.75rem; }
.delete-modal-text { font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 2rem; }
.delete-modal-text strong { color: var(--color-text-primary); }
.delete-modal-actions { display: flex; flex-direction: column; gap: 0.75rem; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .delete-modal-card, .modal-fade-leave-to .delete-modal-card { transform: scale(0.9) translateY(20px); }
</style>
