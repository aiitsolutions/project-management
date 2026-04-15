<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <!-- MODAL HEADER (Refined Dashboard Style) -->
        <header class="modal-header">
           <div class="header-mark"></div>
           <h2>{{ props.parentId ? 'Add Sub Item' : 'Add Project Item' }}</h2>
           <button class="close-btn" @click="close">✕</button>
        </header>

        <!-- SUBTLE TAB NAVIGATION -->
         <nav class="modal-tabs">
           <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'details' }" 
              @click="activeTab = 'details'"
           >Details</button>
           <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'content' }" 
              @click="activeTab = 'content'"
           >Content & Attachments</button>
           <button 
              v-if="canAssignUsers"
              class="tab-btn" 
              :class="{ active: activeTab === 'team' }" 
              @click="activeTab = 'team'"
           >Teams & Capacity</button>
         </nav>

        <form @submit.prevent="handleSubmit" class="modal-form-content">
          <!-- PERSISTENT TITLE INPUT -->
          <div class="input-group title-group">
             <label>Item Name</label>
             <input v-model="form.title" type="text" placeholder="e.g. Implement OAuth Flow" class="input-main-title" required />
          </div>

          <!-- TAB 1: DETAILS -->
          <div v-show="activeTab === 'details'" class="form-grid-primary">
             <div class="input-group">
                <label>Item Type</label>
                <select v-model="form.type">
                   <option value="Story">User Story</option>
                   <option value="Task">Standard Task</option>
                   <option value="Bug">Bug / Issue</option>
                </select>
             </div>
             <div class="input-group">
                <label>Priority</label>
                <select v-model="form.priority">
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                </select>
             </div>
<div class="input-group">
                 <label>Status</label>
                 <select v-model="form.status">
                    <option v-for="status in workspaceItemStatuses" :key="status.id" :value="status.name">{{ status.name }}</option>
                 </select>
              </div>
             <div class="input-group">
                <label>Location</label>
                <select v-model="form.destination">
                   <option value="Backlog">Project Backlog</option>
                   <option v-for="s in activeSprints" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
             </div>

<!-- Estimated Points (based on item type settings) -->
              <div v-if="canHaveEstimatedPoints" class="input-group span-2">
                 <label>Estimated Points</label>
                 <select v-model="form.estimatedPoints" class="fibonacci-select">
                    <option :value="null">Unestimated</option>
                    <option v-for="p in [1, 2, 3, 5, 13, 21, 34, 55, 89]" :key="p" :value="p">{{ p }} Points</option>
                 </select>
              </div>

             <div class="input-group">
                 <label>Start Date</label>
                 <div class="custom-date-wrapper">
                   <input type="date" v-model="form.startDate" class="custom-date-input" />
                 </div>
              </div>
              <div class="input-group">
                 <label>Due Date</label>
                 <div class="custom-date-wrapper">
                   <input type="date" v-model="form.endDate" class="custom-date-input" />
                 </div>
              </div>
             <div class="input-group">
                <label>Estimated Hours</label>
                <div class="custom-hours-input" :class="{ 'auto-calculated': form.teamAllocations.length > 0 }">
                   <input 
                     type="number" 
                     :value="totalEstimatedHours" 
                     placeholder="Auto-calculated from team" 
                     readonly 
                     class="readonly-highlight"
                   />
                   <span class="unit">HRS</span>
                </div>
                <span class="helper-text" v-if="form.teamAllocations.length > 0">Calculated from individual team assignments</span>
             </div>
          </div>

          <!-- TAB 2: CONTENT -->
          <div v-show="activeTab === 'content'" class="content-view-refined">
              <div class="input-group">
                 <label>Requirements & Description</label>
                 <RichTextEditor v-model="form.description" />
              </div>

             <div class="input-group">
                <label>Visual Attachments</label>
                <div class="attachments-area-refined">
                   <div class="upload-zone-refined" @click="$refs.fileInput.click()">
                      <input type="file" ref="fileInput" multiple hidden @change="handleFileChange" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Upload Media</span>
                   </div>
                   <div class="attachments-preview-refined" v-if="attachments.length > 0">
                      <div v-for="(file, idx) in attachments" :key="idx" class="att-thumb">
                         <img :src="file.url" />
                         <button type="button" class="att-close" @click="removeFile(idx)">&times;</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- TAB 3: TEAM -->
          <div v-show="activeTab === 'team' && canAssignUsers" class="team-view-refined">
             <div class="member-search-refined">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search team members..." />
             </div>

             <div class="member-grid-refined">
                <div 
                   v-for="member in teamMembers" 
                   :key="member.id" 
                   class="member-card-refined" 
                   :class="{ selected: isSelected(member.id) }"
                >
                   <div class="member-info-row" @click="toggleMember(member.id)">
                      <div class="member-avatar-refined">
                         <img :src="member.profile_photo || `https://ui-avatars.com/api/?name=${member.name}&background=10B981&color=fff&bold=true`" />
                         <div class="check-dot" v-if="isSelected(member.id)">✓</div>
                      </div>
                      <div class="member-meta">
                         <span class="m-name">{{ member.name }}</span>
                         <span class="m-role">Engineering</span>
                      </div>
                   </div>

                    <div class="member-inputs-refined" v-if="isSelected(member.id)">
                       <div class="member-input-col full-width">
                          <label>Est. Hours</label>
                          <div class="member-hours-input">
                             <input 
                               type="number" 
                               :value="getMemberHours(member.id)" 
                               @input="setMemberHours(member.id, $event)"
                               placeholder="0"
                               step="0.25"
                               min="0"
                             />
                             <span>hrs</span>
                          </div>
                       </div>
                    </div>
                </div>
             </div>

              <div class="alloc-bar-refined" v-if="form.teamAllocations.length > 0">
                 <span>{{ form.teamAllocations.length }} Members assigned • {{ totalEstimatedHours }} Hours total</span>
              </div>
          </div>

          <!-- MODAL ACTIONS -->
          <footer class="modal-footer-refined">
             <span class="footer-note">Unsaved changes are kept as draft</span>
             <div class="footer-btns">
                <button type="button" class="btn-cancel-alt" @click="close">Discard</button>
                <button type="submit" class="btn-save-alt">
                   Complete Item Entry
                </button>
             </div>
          </footer>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialTarget?: string
  initialSprintId?: number | null
  parentId?: number | null
  projectId?: number
}>()

const emit = defineEmits(['close', 'submit'])

const route = useRoute()
const resolvedProjectId = computed(() => props.projectId || Number(route.params.id))

const activeTab = ref('details')
const fileInput = ref<HTMLInputElement | null>(null)
const attachments = ref<any[]>([])

const form = ref({
  title: '',
  description: '',
  type: 'Task',
  priority: 'Medium',
  status: props.initialSprintId ? 'To Do' : 'Backlog',
  destination: props.initialSprintId || props.initialTarget || 'Backlog',
  teamAllocations: [] as { userId: number; effort: number; estimatedHours: number }[],
  startDate: '',
  endDate: '',
  estimatedPoints: null as number | null
})

const totalEstimatedHours = computed(() => {
  return form.value.teamAllocations.reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0)
})

const teamMembers = ref<any[]>([])
const sprints = ref<any[]>([])
const workspaceItemStatuses = ref<any[]>([])
const itemTypeSettings = ref<any>({
  Story: { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
  Task:  { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
  Bug:   { allowEstimatedPoints: false, canBeSubItem: true, allowUserAssignment: true }
})

const activeSprints = computed(() => {
  return sprints.value.filter(s => s.status !== 'Completed')
})

const canHaveEstimatedPoints = computed(() => {
  return itemTypeSettings.value[form.value.type]?.allowEstimatedPoints ?? true
})

const canAssignUsers = computed(() => {
  return itemTypeSettings.value[form.value.type]?.allowUserAssignment ?? true
})

const fetchInternalData = async () => {
  try {
    const [uData, sData, statusData] = await Promise.all([
      $fetch<any[]>('/api/users'),
      $fetch<any[]>(`/api/sprints?projectId=${resolvedProjectId.value}`),
      $fetch<any>('/api/workspace/statuses')
    ])
    teamMembers.value = uData
    sprints.value = sData
    workspaceItemStatuses.value = statusData.items || []
    if (statusData.itemTypes) {
      itemTypeSettings.value = statusData.itemTypes
    }
  } catch (e) {
    console.error('Failed to fetch modal data', e)
  }
}

onMounted(fetchInternalData)

const isSelected = (id: number) => form.value.teamAllocations.some(a => a.userId === id)
const getEffort = (id: number) => form.value.teamAllocations.find(a => a.userId === id)?.effort || 0
const getMemberHours = (id: number) => form.value.teamAllocations.find(a => a.userId === id)?.estimatedHours || 0

const setMemberHours = (id: number, event: Event) => {
  const hours = Number((event.target as HTMLInputElement).value)
  const allocation = form.value.teamAllocations.find(a => a.userId === id)
  if (allocation) {
    allocation.estimatedHours = hours
  }
}

const toggleMember = (id: number) => {
  const idx = form.value.teamAllocations.findIndex(a => a.userId === id)
  if (idx === -1) {
    form.value.teamAllocations.push({ userId: id, effort: 1, estimatedHours: 0 })
  } else {
    form.value.teamAllocations.splice(idx, 1)
  }
}

const updateEffort = (id: number, delta: number) => {
  const allocation = form.value.teamAllocations.find(a => a.userId === id)
  if (allocation) {
    allocation.effort = Math.max(1, allocation.effort + delta)
  }
}

const handleFileChange = (e: any) => {
  const files = e.target.files
  if (!files) return
  for (let file of files) {
    attachments.value.push({
      name: file.name,
      url: URL.createObjectURL(file)
    })
  }
}

const removeFile = (idx: number) => {
  attachments.value.splice(idx, 1)
}

const close = () => {
  attachments.value = []
  emit('close')
}

const handleSubmit = async () => {
  if (!form.value.title) return
  
  const sprintId = form.value.destination === 'Backlog' ? null : Number(form.value.destination)
  
  try {
    const res = await $fetch('/api/items', {
      method: 'POST',
      body: {
        projectId: resolvedProjectId.value,
        title: form.value.title,
        description: form.value.description,
        type: form.value.type,
        priority: form.value.priority,
        status: 'Backlog',
        sprintId: sprintId,
        parentId: props.parentId || null,
        teamAllocations: form.value.teamAllocations,
        startDate: form.value.startDate,
        endDate: form.value.endDate,
        estimatedHours: totalEstimatedHours.value,
        estimatedPoints: form.value.estimatedPoints
      }
    })
    emit('submit', res)
    close()
    // Reset form
    form.value = {
      title: '',
      description: '',
      type: 'Task',
      priority: 'Medium',
      status: 'To-do',
      destination: props.initialTarget || 'Backlog',
      teamAllocations: [],
      startDate: '',
      endDate: '',
      estimatedPoints: null
    }
  } catch (e) {
    alert('Failed to save item')
  }
}

watch(() => props.initialTarget, (newVal) => {
  if (newVal) form.value.destination = newVal
})

watch(() => props.initialSprintId, (newVal) => {
  if (newVal !== undefined) {
    // If initialSprintId is provided and valid, use it as destination
    // Otherwise fall back to Backlog
    form.value.destination = newVal || 'Backlog'
  }
}, { immediate: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: var(--font-family);
}

.modal-container {
  background: var(--color-bg-card);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

/* HEADER */
.modal-header {
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-mark { width: 3px; height: 18px; background: var(--color-primary-light); border-radius: 99px; }
.modal-header h2 { margin: 0; flex: 1; font-size: 1.15rem; font-weight: 600; color: var(--color-text-primary); }
.close-btn { background: transparent; border: none; font-size: 1rem; color: var(--color-text-muted); cursor: pointer; transition: color 0.1s; }
.close-btn:hover { color: var(--color-text-primary); }

/* TABS */
.modal-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 2rem;
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border-light);
}
.tab-btn {
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover { background: var(--color-border-light); color: var(--color-text-primary); }
.tab-btn.active { background: var(--color-bg-card); color: var(--color-text-primary); font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* FORM CONTENT */
.modal-form-content {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.input-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-group label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

.input-main-title {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-bg-main);
  outline: none;
  transition: all 0.2s;
}
.input-main-title:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.input-main-title::placeholder { color: var(--color-text-light); }

/* GRID */
.form-grid-primary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.span-2 { grid-column: span 2; }

/* INPUTS */
select, .custom-date-wrapper .custom-date-input, .custom-hours-input input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  background: var(--color-bg-main);
  outline: none;
  cursor: pointer;
  width: 100%;
}

.custom-date-wrapper {
  position: relative;
}

.custom-date-input {
  position: relative;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

select:focus, .custom-date-wrapper .custom-date-input:focus, .custom-hours-input input:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }

/* HOURS INPUT */
.custom-hours-input { position: relative; display: flex; align-items: center; }
.custom-hours-input input { width: 100%; padding-right: 3rem; }
.custom-hours-input .unit { position: absolute; right: 1rem; font-size: 0.7rem; font-weight: 800; color: var(--color-text-muted); pointer-events: none; }

/* EFFORT SUMMARY */
.effort-summary-alt {
  background: var(--color-bg-main);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.effort-val { font-size: 2.25rem; font-weight: 700; color: var(--color-primary-light); line-height: 1; }
.effort-text { display: flex; flex-direction: column; flex: 1; }
.effort-text strong { font-size: 0.95rem; color: var(--color-text-primary); }
.effort-text span { font-size: 0.8rem; color: var(--color-text-muted); }
.btn-subtle { background: var(--color-bg-card); border: 1px solid var(--color-border); padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; transition: 0.2s; }
.btn-subtle:hover { border-color: var(--color-primary-light); color: var(--color-primary-light); }

/* CONTENT REFINED */
.content-view-refined { display: flex; flex-direction: column; gap: 1.25rem; }
.rich-text-wrapper { border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; background: var(--color-bg-card); }
.editor-bar-refined { background: var(--color-bg-main); border-bottom: 1px solid var(--color-border); padding: 0.5rem; display: flex; gap: 0.25rem; }
.editor-bar-refined button { background: transparent; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: var(--color-text-muted); cursor: pointer; }
.v-div { width: 1px; height: 16px; background: var(--color-border); margin: 0 0.25rem; }
.editor-area-refined { width: 100%; border: none; padding: 1rem; min-height: 120px; font-size: 0.95rem; outline: none; font-family: inherit; resize: none; color: var(--color-text-primary); background: transparent; }

.attachments-area-refined { display: flex; gap: 1rem; align-items: start; }
.upload-zone-refined { border: 1.5px dashed var(--color-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.2s; min-width: 120px; }
.upload-zone-refined:hover { border-color: var(--color-primary-light); background: var(--nav-active-bg, #F0FDF4); }
.upload-zone-refined span { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); }

.attachments-preview-refined { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.att-thumb { width: 64px; height: 64px; border-radius: 8px; border: 1px solid var(--color-border); position: relative; overflow: hidden; }
.att-thumb img { width: 100%; height: 100%; object-fit: cover; }
.att-close { position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,0.5); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }

/* TEAM REFINED */
.team-view-refined { display: flex; flex-direction: column; gap: 1.25rem; }
.member-search-refined { display: flex; align-items: center; gap: 0.75rem; background: var(--color-bg-main); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--color-border); }
.member-search-refined input { border: none; background: transparent; color: var(--color-text-primary); outline: none; width: 100%; font-size: 0.95rem; }

.member-grid-refined { display: grid; grid-template-columns: 1fr; gap: 0.75rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem; }
.member-card-refined { 
  display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; 
  background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: 14px; transition: 0.2s; 
}
.member-card-refined.selected { border-color: var(--color-primary-light); background: var(--nav-active-bg, #F0FDF4); }

.member-info-row { display: flex; align-items: center; gap: 1rem; cursor: pointer; flex: 1; }
.member-avatar-refined { position: relative; }
.member-avatar-refined img { width: 36px; height: 36px; border-radius: 50%; }
.check-dot { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: var(--color-primary-light); color: white; font-size: 8px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; }

.member-meta { display: flex; flex-direction: column; }
.m-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.m-role { font-size: 0.75rem; color: var(--color-text-muted); }

.member-inputs-refined { display: flex; gap: 1rem; margin-top: 0.5rem; }
.member-input-col { display: flex; flex-direction: column; gap: 0.25rem; }
.member-input-col label { font-size: 0.6rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }

.member-input-col.full-width {
  width: 100%;
}

.member-hours-input { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  background: var(--color-bg-card); 
  border: 1px solid var(--color-border); 
  border-radius: 8px; 
  padding: 0.5rem 0.75rem; 
  width: 100%;
}

.member-hours-input input { 
  width: 100%; 
  border: none; 
  background: transparent; 
  color: var(--color-text-primary); 
  font-size: 0.9rem; 
  font-weight: 600; 
  outline: none; 
}

.member-hours-input span { 
  font-size: 0.75rem; 
  font-weight: 700; 
  color: var(--color-text-muted); 
}

.custom-hours-input.auto-calculated { border-color: var(--color-primary-light); }
.readonly-highlight { background: var(--nav-active-bg, #F0FDF4) !important; font-weight: 800 !important; color: var(--color-success) !important; }
.helper-text { font-size: 0.7rem; color: var(--color-primary-light); font-weight: 500; margin-top: 0.25rem; }

.alloc-bar-refined { background: var(--color-text-primary); color: var(--color-bg-main); padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; font-weight: 500; text-align: center; }

/* FOOTER */
.modal-footer-refined { border-top: 1px solid var(--color-border); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.footer-note { font-size: 0.8rem; color: var(--color-text-muted); }
.footer-btns { display: flex; gap: 0.75rem; }
.btn-save-alt { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-save-alt:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
.btn-cancel-alt { background: var(--color-bg-card); border: 1px solid var(--color-border); padding: 0.75rem 1.25rem; border-radius: 8px; color: var(--color-text-secondary); font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-cancel-alt:hover { background: var(--color-bg-main); border-color: var(--color-primary); color: var(--color-primary); }

/* Effort Input */
.member-effort-input {
  position: relative;
}

.effort-input-inner {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-bg-main);
}

.effort-input-inner button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.effort-input-inner button:hover {
  background: var(--color-bg-card);
  color: var(--color-primary-light);
}

.effort-input-inner button.plus {
  background: var(--color-primary-light);
  color: white;
}

.effort-input-inner button.plus:hover {
  filter: brightness(1.1);
}

.effort-input-inner .points-val {
  width: 40px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

/* ANIMATION */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-container { animation: modal-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modal-slide { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
