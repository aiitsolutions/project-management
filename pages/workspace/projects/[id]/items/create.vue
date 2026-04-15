<template>
  <div class="studio-native-content" :style="{ '--primary-color': primaryColor }">
    
    <!-- STUDIO ACTION HEADER (Native to the Content Area) -->
    <header class="studio-view-header">
       <div class="studio-titles">
          <h1>New Backlog Item</h1>
          <p>Defining requirements for project item 10{{ route.params.id }}</p>
       </div>
       <div class="header-buttons">
          <NuxtLink :to="`/workspace/projects/${route.params.id}/backlog`" class="btn-secondary-thematic">Discard</NuxtLink>
          <button class="btn-primary-thematic" @click="handleSubmit">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
             Save Project Item
          </button>
       </div>
    </header>

    <!-- STUDIO INTERNAL TABS -->
    <nav class="studio-internal-tabs">
       <button class="studio-tab-btn" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">
          Primary Details
          <span class="active-bar" v-if="activeTab === 'details'"></span>
       </button>
       <button class="studio-tab-btn" :class="{ active: activeTab === 'content' }" @click="activeTab = 'content'">
          Description & Media
          <span class="active-bar" v-if="activeTab === 'content'"></span>
       </button>
        <button class="studio-tab-btn" :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'" v-if="canAssignUsers">
           Team Allocation
           <span class="active-bar" v-if="activeTab === 'team'"></span>
        </button>
    </nav>

    <div class="studio-form-space">
       <form @submit.prevent="handleSubmit" class="studio-form-grid">
          
          <!-- ITEM NAME (Hero Design) -->
          <div class="hero-name-container" v-show="activeTab === 'details'">
             <label class="platform-label">ITEM NAME</label>
             <input v-model="form.title" type="text" placeholder="e.g. Real-time updates..." class="hero-input-thematic" required />
          </div>

          <!-- TAB 1: DETAILS -->
          <div v-show="activeTab === 'details'" class="studio-card-row">
             <div class="studio-card">
                <div class="card-p-header"><h4 class="card-p-title">Configurations</h4></div>
                <div class="field-stack">
                   <div class="field-wrap">
                      <label class="platform-label">Item Type</label>
                      <div class="custom-select-trigger-spec" @click="toggleDropdown('type')">{{ form.type }}</div>
                      <div v-if="activeDropdown === 'type'" class="custom-dropdown-panel-thematic">
                         <div class="dropdown-option" @click="selectOption('type', 'Story')">User Story</div>
                         <div class="dropdown-option" @click="selectOption('type', 'Task')">Task</div>
                         <div class="dropdown-option" @click="selectOption('type', 'Bug')">Bug</div>
                      </div>
                   </div>
                   <div class="field-wrap mt-4">
                      <label class="platform-label">Priority</label>
                      <div class="custom-select-trigger-spec" @click="toggleDropdown('priority')">{{ form.priority }}</div>
                      <div v-if="activeDropdown === 'priority'" class="custom-dropdown-panel-thematic">
                         <div class="dropdown-option" @click="selectOption('priority', 'Low')">Low</div>
                         <div class="dropdown-option" @click="selectOption('priority', 'Medium')">Medium</div>
                         <div class="dropdown-option" @click="selectOption('priority', 'High')">High</div>
                      </div>
                   </div>
                   <!-- SPRINT FIELD -->
                   <div class="field-wrap mt-4">
                      <label class="platform-label">Sprint</label>
                      <div class="custom-select-trigger-spec" @click="toggleDropdown('sprint')">
                         {{ selectedSprintLabel }}
                      </div>
                      <div v-if="activeDropdown === 'sprint'" class="custom-dropdown-panel-thematic">
                         <div class="dropdown-option" @click="selectSprint(null)">[ Backlog ]</div>
                         <div v-for="s in availableSprints" :key="s.id" class="dropdown-option" @click="selectSprint(s)">
                            {{ s.name }} <small v-if="s.status === 'In Progress'">(Active)</small>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div class="studio-card">
                <div class="card-p-header"><h4 class="card-p-title">Timeline</h4></div>
                <div class="field-stack">
                    <div class="field-wrap">
                       <label class="platform-label">Start Date</label>
                       <div class="custom-select-trigger-spec" @click="toggleDatePicker('start')">{{ form.startDate || 'Select Date' }}</div>
                       <div v-if="activeDatePicker === 'start'" class="custom-dropdown-panel-thematic date-picker-panel" @click.stop>
                          <div class="calendar-header">
                            <button type="button" @click="prevMonth">←</button>
                            <span class="font-bold">{{ monthNames[currentCalMonth] }} {{ currentCalYear }}</span>
                            <button type="button" @click="nextMonth">→</button>
                          </div>
                          <div class="calendar-grid">
                             <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
                             <div v-for="(day, idx) in calendarDays" :key="idx" class="cal-day" :class="{'empty': day.empty, 'selected': day.fullDate === form.startDate}" @click="day.empty ? null : selectDate(day.fullDate!)">
                                {{ day.empty ? '' : day.date }}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div class="field-wrap mt-4">
                       <label class="platform-label">Target Deadline</label>
                       <div class="custom-select-trigger-spec" @click="toggleDatePicker('end')">{{ form.endDate || 'Select Date' }}</div>
                       <div v-if="activeDatePicker === 'end'" class="custom-dropdown-panel-thematic date-picker-panel" @click.stop>
                          <div class="calendar-header">
                            <button type="button" @click="prevMonth">←</button>
                            <span class="font-bold">{{ monthNames[currentCalMonth] }} {{ currentCalYear }}</span>
                            <button type="button" @click="nextMonth">→</button>
                          </div>
                          <div class="calendar-grid">
                             <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
                             <div v-for="(day, idx) in calendarDays" :key="idx" class="cal-day" :class="{'empty': day.empty, 'selected': day.fullDate === form.endDate}" @click="day.empty ? null : selectDate(day.fullDate!)">
                                {{ day.empty ? '' : day.date }}
                             </div>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          <!-- TAB 2: CONTENT -->
          <div v-show="activeTab === 'content'" class="studio-full-row">
             <div class="studio-card">
                <div class="card-p-header"><h4 class="card-p-title">Project Documentation</h4></div>
                <div class="editor-thematic">
                   <RichTextEditor v-model="form.description" />
                </div>
             </div>
          </div>

          <!-- TAB 3: TEAM -->
          <div v-show="activeTab === 'team'" class="studio-full-row">
             <div class="studio-card">
                <div class="card-p-header"><h4 class="card-p-title">Team Allocation</h4></div>
                <div class="team-grid-thematic">
                   <div v-for="m in teamMembers" :key="m.id" class="member-tile" :class="{ selected: isSelected(m.id) }" @click="toggleMember(m.id)">
                      <div class="tile-orb">
                         <img :src="`https://ui-avatars.com/api/?name=${m.name}&background=10B981&color=fff&bold=true`" />
                         <div class="tile-check" v-if="isSelected(m.id)">✓</div>
                      </div>
                      <strong>{{ m.name }}</strong>
                   </div>
                </div>
             </div>
          </div>

       </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { settings: appSettings } = useSettings()
const primaryColor = ref(appSettings.value.colorScheme || '#10B981')
const activeTab = ref('details')
const activeDropdown = ref<string | null>(null)
const activeDatePicker = ref<string | null>(null)
const sprints = ref<any[]>([])
const teamMembers = ref<any[]>([])
const itemTypeSettings = ref<any>({
  Story: { allowUserAssignment: true },
  Task: { allowUserAssignment: true },
  Bug: { allowUserAssignment: true }
})

const canAssignUsers = computed(() => {
  return itemTypeSettings.value[form.value.type]?.allowUserAssignment ?? true
})

const availableSprints = computed(() => {
  return sprints.value.filter(s => s.status !== 'Completed')
})

const selectedSprintLabel = computed(() => {
  if (!form.value.sprintId) return 'Backlog'
  const s = sprints.value.find(s => s.id === form.value.sprintId)
  return s ? s.name : 'Backlog'
})

const form = ref({
  title: '',
  description: '',
  type: 'Task',
  priority: 'Medium',
  startDate: '',
  endDate: '',
  sprintId: null as number | null,
  teamAllocations: [] as { userId: number; effort: number }[]
})

// Use target from query if available
onMounted(async () => {
  await Promise.all([
    fetchSprints(), 
    fetchUsers(),
    fetchWorkspaceSettings()
  ])
  if (route.query.target === 'Backlog') {
     form.value.sprintId = null
  }
  window.addEventListener('click', closeAllPopups)
})

const fetchWorkspaceSettings = async () => {
  try {
    const data = await $fetch('/api/workspace/statuses')
    if (data.itemTypes) {
      itemTypeSettings.value = data.itemTypes
    }
  } catch (e) {
    console.error('Failed to fetch workspace settings', e)
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
    teamMembers.value = data.filter((u: any) => u.is_active !== false)
  } catch (e) {
    console.error('Failed to fetch users')
  }
}

onUnmounted(() => {
  window.removeEventListener('click', closeAllPopups)
})

const closeAllPopups = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.field-wrap')) {
    activeDropdown.value = null
    activeDatePicker.value = null
  }
}

const toggleDropdown = (f: string) => {
  activeDatePicker.value = null;
  activeDropdown.value = activeDropdown.value === f ? null : f;
}

const selectOption = (f: string, v: any) => { 
  (form.value as any)[f] = v; 
  activeDropdown.value = null; 
}

const toggleDatePicker = (f: string) => {
  activeDropdown.value = null;
  activeDatePicker.value = activeDatePicker.value === f ? null : f;
}

const selectSprint = (s: any) => {
  form.value.sprintId = s ? s.id : null
  activeDropdown.value = null
}

// CALENDAR LOGIC
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentCalMonth = ref(new Date().getMonth());
const currentCalYear = ref(new Date().getFullYear());

const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentCalYear.value, currentCalMonth.value, 1).getDay();
  const daysInMonth = new Date(currentCalYear.value, currentCalMonth.value + 1, 0).getDate();
  
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true });
  }
  
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentCalYear.value}-${String(currentCalMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ date: i, fullDate, empty: false });
  }
  
  return days;
});

const prevMonth = () => {
  if (currentCalMonth.value === 0) {
    currentCalMonth.value = 11;
    currentCalYear.value--;
  } else {
    currentCalMonth.value--;
  }
};

const nextMonth = () => {
  if (currentCalMonth.value === 11) {
    currentCalMonth.value = 0;
    currentCalYear.value++;
  } else {
    currentCalMonth.value++;
  }
};

const selectDate = (date: string) => {
  if (activeDatePicker.value === 'start') {
    form.value.startDate = date;
  } else if (activeDatePicker.value === 'end') {
    form.value.endDate = date;
  }
  activeDatePicker.value = null;
};

const isSelected = (id: number) => form.value.teamAllocations.some(a => a.userId === id)
const toggleMember = (id: number) => {
  const i = form.value.teamAllocations.findIndex(a => a.userId === id)
  if (i === -1) form.value.teamAllocations.push({ userId: id, effort: 1 })
  else form.value.teamAllocations.splice(i, 1)
}

const { addToast } = useToast()

const handleSubmit = async () => {
  if (!form.value.title) {
    addToast('Item title is required', 'warning')
    return
  }
  try {
    await $fetch('/api/items', {
      method: 'POST',
      body: {
        projectId: Number(route.params.id),
        title: form.value.title,
        description: form.value.description,
        type: form.value.type,
        priority: form.value.priority,
        startDate: form.value.startDate,
        endDate: form.value.endDate,
        sprintId: form.value.sprintId,
        teamAllocations: form.value.teamAllocations
      }
    })
    addToast('New Backlog Item Created', 'success')
    router.push(`/workspace/projects/${route.params.id}/backlog`)
  } catch (e) {
    addToast('Failed to create item', 'error')
  }
}
</script>

<style scoped>
.studio-native-content { width: 100%; display: flex; flex-direction: column; overflow: visible !important; }

/* HEADER */
.studio-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.studio-titles h1 { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.025em; margin: 0 0 0.25rem 0; }
.studio-titles p { font-size: 0.9rem; color: var(--color-text-muted); font-weight: 500; margin: 0; }

.header-buttons { display: flex; gap: 1rem; }
.btn-primary-thematic { background: var(--primary-color); color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 12px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-secondary-thematic { background: var(--color-bg-card); border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 0.85rem 1.75rem; border-radius: 12px; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; }

/* INTERNAL TABS */
.studio-internal-tabs { display: flex; gap: 2rem; border-bottom: 2px solid var(--color-border-light); margin-bottom: 3rem; }
.studio-tab-btn { background: transparent; border: none; padding: 1rem 0.5rem; font-size: 0.95rem; font-weight: 500; color: var(--color-text-muted); cursor: pointer; position: relative; }
.studio-tab-btn.active { color: var(--primary-color); font-weight: 600; }
.active-bar { position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: var(--primary-color); }

.studio-form-space { width: 100%; }

/* HERO INPUT */
.hero-name-container { margin-bottom: 3rem; }
.hero-input-thematic { width: 100%; border: none; border-bottom: 2px solid var(--color-border-light); background: transparent; font-size: 1.75rem; font-weight: 600; color: var(--color-text-primary); outline: none; padding-bottom: 0.75rem; transition: 0.2s; }
.hero-input-thematic:focus { border-color: var(--primary-color); }

/* CARDS */
.studio-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.studio-card { background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: visible !important; }
.card-p-header { margin-bottom: 2rem; }
.card-p-title { font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }

.field-wrap { display: flex; flex-direction: column; gap: 0.75rem; position: relative; }
.platform-label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.custom-select-trigger-spec { padding: 0 1rem; border: 1px solid var(--color-border); border-radius: 12px; font-size: 0.95rem; font-weight: 500; min-height: 48px; background: var(--color-bg-card); cursor: pointer; display: flex; align-items: center; color: var(--color-text-primary); }

/* DROPDOWNS */
.custom-dropdown-panel-thematic { 
  position: absolute; 
  top: calc(100% + 12px); 
  left: 0; 
  width: 100%; 
  min-width: 240px;
  background: var(--color-bg-card); 
  border: 1px solid var(--color-border); 
  border-radius: 12px; 
  box-shadow: 0 15px 50px rgba(0,0,0,0.12); 
  z-index: 5000; 
  overflow: hidden; 
  animation: slide-up 0.2s ease-out;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.date-picker-panel { width: 320px; padding: 1rem; }

.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem; }
.calendar-header button { background: var(--color-bg-subtle); border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--color-text-primary); }
.calendar-header button:hover { background: var(--color-border); }

.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day-name { text-align: center; font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); padding: 0.5rem 0; text-transform: uppercase; }
.cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 500; cursor: pointer; border-radius: 8px; transition: 0.1s; color: var(--color-text-secondary); }
.cal-day:hover:not(.empty) { background: var(--color-bg-subtle); color: var(--color-text-primary); }
.cal-day.selected { background: var(--primary-color) !important; color: white !important; font-weight: 700; }
.cal-day.empty { cursor: default; }

.dropdown-option { padding: 0.85rem 1.25rem; font-size: 0.95rem; color: var(--color-text-secondary); cursor: pointer; transition: 0.1s; border-bottom: 1px solid var(--color-border-light); }
.dropdown-option:last-child { border-bottom: none; }
.dropdown-option:hover { background: var(--color-bg-subtle); color: var(--color-text-primary); padding-left: 1.5rem; }

/* EDITOR */
.editor-thematic { border: 1px solid var(--color-border-light); border-radius: 12px; overflow: hidden; background: var(--color-bg-card); }

/* TEAM */
.team-grid-thematic { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1.5rem; }
.member-tile { background: var(--color-bg-subtle); border: 1px solid var(--color-border-light); border-radius: 16px; padding: 1.5rem; text-align: center; cursor: pointer; transition: 0.2s; }
.member-tile:hover { background: var(--color-bg-card); border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.member-tile.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.tile-orb { position: relative; display: inline-block; margin-bottom: 0.75rem; }
.tile-orb img { width: 56px; height: 56px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.tile-check { position: absolute; bottom: 0; right: 0; background: var(--primary-color); color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

.mt-4 { margin-top: 1.5rem; }
</style>
