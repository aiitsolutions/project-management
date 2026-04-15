<template>
  <div class="burn-report-container">
    <header class="report-header">
      <div class="header-main">
        <h2 class="report-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="stroke: var(--primary-color)" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Burn Report
        </h2>
        <p class="report-subtitle">Sprint Velocity & Burndown Analysis</p>
      </div>
      <div class="report-actions">
        <div class="sprint-picker">
          <label>Selected Sprint</label>
          <div class="custom-dropdown" @click="showSprintDropdown = !showSprintDropdown" v-outside="() => showSprintDropdown = false">
            <div class="dropdown-trigger">
              <span class="curr-val">{{ selectedSprint?.name || 'Loading...' }}</span>
              <svg :class="{ rotate: showSprintDropdown }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <transition name="pop">
              <div v-if="showSprintDropdown" class="dropdown-menu">
                <div 
                  v-for="s in sprints" 
                  :key="s.id" 
                  class="dropdown-item" 
                  :class="{ active: String(s.id) === selectedSprintIdStr }"
                  @click.stop="selectSprint(s)"
                >
                  <span class="s-dot" :class="s.status.toLowerCase().replace(' ', '-')"></span>
                  <span class="s-name">{{ s.name }}</span>
                  <span class="s-status">{{ s.status }}</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <!-- KPI Row -->
    <div class="kpi-row">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="kpi-card skeleton-card">
          <div class="skel skel-label"></div>
          <div class="skel skel-val"></div>
          <div class="skel skel-sub"></div>
        </div>
      </template>
      <template v-else>
        <div class="kpi-card reveal" style="--delay:0ms">
          <span class="kpi-label">Total Scope</span>
          <span class="kpi-val">{{ totalItems }}</span>
          <span class="kpi-sub">items in sprint</span>
        </div>
        <div class="kpi-card success reveal" style="--delay:80ms">
          <span class="kpi-label">Completed</span>
          <span class="kpi-val">{{ completedItems }}</span>
          <span class="kpi-sub">{{ completionPercent }}% done</span>
        </div>
        <div class="kpi-card warn reveal" style="--delay:160ms">
          <span class="kpi-label">Remaining</span>
          <span class="kpi-val">{{ remainingItems }}</span>
          <span class="kpi-sub">open tasks</span>
        </div>
        <div class="kpi-card info reveal" style="--delay:240ms">
          <span class="kpi-label">Sprint Days</span>
          <span class="kpi-val">{{ sprintDays }}</span>
          <span class="kpi-sub">day duration</span>
        </div>
      </template>
    </div>

    <!-- SVG Burndown Chart -->
    <div v-if="isLoading" class="chart-card skeleton-chart-card">
      <div class="skeleton-chart-inner">
        <div class="skel skel-chart-title"></div>
        <div class="skeleton-chart-area">
          <div class="shimmer-bar" v-for="n in 6" :key="n" :style="`height: ${30 + n * 12}%`"></div>
        </div>
      </div>
    </div>
    <div v-if="!isLoading" class="chart-card reveal" style="--delay:300ms">
      <div class="chart-header">
        <h3>Burndown Curve</h3>
        <div class="legend">
          <div class="legend-item"><span class="l-dot ideal"></span>Ideal</div>
          <div class="legend-item"><span class="l-dot actual"></span>Actual</div>
        </div>
      </div>
      <div v-if="totalItems === 0" class="chart-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        <p>No items found for this sprint</p>
      </div>
      <svg v-else :viewBox="`0 0 ${svgW} ${svgH}`" class="burndown-svg" preserveAspectRatio="none">
        <g class="grid-lines">
        <line v-for="(y, i) in yGridLines" :key="'yg'+i" :x1="pad.left" :y1="y" :x2="svgW - pad.right" :y2="y" stroke="var(--color-border-light)" stroke-width="1"/>
        <line v-for="(x, i) in xGridLines" :key="'xg'+i" :x1="x" :y1="pad.top" :x2="x" :y2="svgH - pad.bottom" stroke="var(--color-border-light)" stroke-width="1"/>
      </g>
      <g class="y-labels">
        <text v-for="(tick, i) in yTicks" :key="'yl'+i" :x="pad.left - 12" :y="yScale(tick) + 4" text-anchor="end" font-size="12" font-family="Inter, sans-serif" fill="var(--color-text-muted)" font-weight="700">{{ tick }}</text>
      </g>
      <g class="x-labels">
        <text v-for="(day, i) in displayDays" :key="'xl'+i" :x="xScale(i)" :y="svgH - pad.bottom + 24" text-anchor="middle" font-size="12" font-family="Inter, sans-serif" fill="var(--color-text-muted)" font-weight="700">{{ day }}</text>
      </g>
      <path v-if="idealPoints.length > 1" :d="areaPath(idealPoints)" fill="var(--color-border-light)" opacity="0.1" stroke="none"/>
      <polyline v-if="idealPoints.length > 1" :points="pointsStr(idealPoints)" fill="none" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="5,4"/>
      <path v-if="actualPoints.length > 1" :d="areaPath(actualPoints)" fill="var(--primary-color)" opacity="0.08" stroke="none"/>
      <polyline v-if="actualPoints.length > 1" :points="pointsStr(actualPoints)" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g v-if="actualPoints.length > 0">
        <circle v-for="(pt, i) in actualPoints" :key="'ap'+i" :cx="pt[0]" :cy="pt[1]" r="5" fill="var(--primary-color)" stroke="var(--color-bg-card)" stroke-width="2"/>
      </g>
      <line :x1="pad.left" :y1="pad.top" :x2="pad.left" :y2="svgH - pad.bottom" stroke="var(--color-border)" stroke-width="1.5"/>
      <line :x1="pad.left" :y1="svgH - pad.bottom" :x2="svgW - pad.right" :y2="svgH - pad.bottom" stroke="var(--color-border)" stroke-width="1.5"/>
      </svg>
      <div class="progress-bar-section">
        <div class="progress-label"><span>Sprint Progress</span><span class="progress-pct">{{ completionPercent }}%</span></div>
        <div class="progress-track"><div class="progress-fill" :style="`width: ${completionPercent}%`"></div></div>
      </div>
    </div>

    <!-- Activity Table -->
    <div v-if="!isLoading && sprintDayRows.length > 0" class="activity-table-card reveal" style="--delay:450ms">
      <div class="table-header-row"><h3>Daily Activity Log</h3><span class="table-subtitle">Sprint: <strong>{{ selectedSprint?.name }}</strong></span></div>
      <div class="table-scroll">
        <table class="activity-table">
          <thead><tr><th>Date</th><th>Completed</th><th>Reopened</th><th>Newly Added</th><th>Pending Tasks</th></tr></thead>
          <tbody>
            <tr v-for="(row, i) in sprintDayRows" :key="i" :class="{ 'today-row': row.isToday, 'start-row': row.isStart }">
              <td class="date-cell">{{ row.label }}<span v-if="row.isStart" class="row-badge start">Actual Start Date</span><span v-if="row.isToday" class="row-badge today">Today</span></td>
              <td><button v-if="row.completed > 0" class="activity-btn completed" @click="openPanel('completed', row)">(-) {{ row.completed }}</button><span v-else class="dash">-</span></td>
              <td><button v-if="row.reopened > 0" class="activity-btn reopened" @click="openPanel('reopened', row)">(+) {{ row.reopened }}</button><span v-else class="dash">-</span></td>
              <td><button v-if="row.added > 0" class="activity-btn added" @click="openPanel('added', row)">(+) {{ row.added }}</button><span v-else class="dash">-</span></td>
              <td class="pending-cell">{{ row.pending }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Task Slide Panel (Premium SaaS Style) -->
    <transition name="slide-panel">
      <div v-if="activePanel" class="task-panel-overlay" @click.self="activePanel = null">
        <div class="task-panel">
          <header class="panel-header">
            <div class="panel-title-area">
              <span class="panel-category">{{ activePanel?.type?.toUpperCase() }} ACTIVITY</span>
              <h3>{{ panelTitle }}</h3>
              <p class="panel-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ activePanel?.row?.label }}
              </p>
            </div>
            <button class="panel-close-btn" @click="activePanel = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </header>

          <div class="panel-body custom-scrollbar">
            <div v-if="panelItems.length === 0" class="panel-empty-state">
              <div class="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <p>No activity records for this selection</p>
            </div>

            <div v-else class="panel-list-view">
              <div v-for="item in panelItems" :key="item.id" class="panel-task-card" @click="viewItemDetail(item.id)">
                <div class="task-card-icon" :class="item.type.toLowerCase()">
                  <svg v-if="item.type === 'Bug'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="13" r="6"></circle><path d="M12 7V3M8 3l1.5 3M16 3l-1.5 3"></path></svg>
                  <svg v-else-if="item.type === 'Story'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div class="task-card-content">
                  <div class="task-card-header">
                    <span class="task-uid-label">{{ item.uid }}</span>
                    <span class="task-status-pill" :class="item.status.toLowerCase().replace(' ', '-')">{{ item.status }}</span>
                  </div>
                  <h4 class="task-card-title">{{ item.title }}</h4>
                </div>
                <div class="task-card-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <footer class="panel-footer">
            <button class="btn-panel-dismiss" @click="activePanel = null">Close Details</button>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
const route = useRoute(); const router = useRouter()
const sprints = ref([]); const allItems = ref([]); const selectedSprintIdStr = ref('')
const showSprintDropdown = ref(false)
const selectSprint = (s) => {
  selectedSprintIdStr.value = String(s.id)
  showSprintDropdown.value = false
}
const selectedSprintId = computed(() => selectedSprintIdStr.value ? parseInt(selectedSprintIdStr.value) : null)
const selectedSprint = computed(() => sprints.value.find(s => s.id === selectedSprintId.value))
const sprintItems = computed(() => allItems.value.filter(i => i.sprintId === selectedSprintId.value))
const isLoading = ref(false)
const totalItems = computed(() => sprintItems.value.length)
const completedItems = computed(() => sprintItems.value.filter(i => i.status === 'Completed').length)
const remainingItems = computed(() => totalItems.value - completedItems.value)
const completionPercent = computed(() => totalItems.value ? Math.round((completedItems.value / totalItems.value) * 100) : 0)
const sprintDays = computed(() => {
  if (!selectedSprint.value) return 0
  const s = new Date(selectedSprint.value.startDate), e = new Date(selectedSprint.value.endDate)
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1)
})
const svgW = 800; const svgH = 380; const pad = { top: 30, right: 40, bottom: 50, left: 55 }
const chartW = computed(() => svgW - pad.left - pad.right); const chartH = computed(() => svgH - pad.top - pad.bottom)
const yScale = (val) => pad.top + chartH.value - (val / Math.max(1, totalItems.value || 10)) * chartH.value
const xScale = (i) => pad.left + (i / Math.max(1, sprintDays.value - 1)) * chartW.value
const yTicks = computed(() => { const step = Math.ceil((totalItems.value || 10)/5); return [0,1,2,3,4,5].map(v => v*step) })
const yGridLines = computed(() => yTicks.value.map(t => yScale(t)))
const displayDays = computed(() => {
  if (!selectedSprint.value) return []
  const start = new Date(selectedSprint.value.startDate)
  return Array.from({ length: sprintDays.value }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
}); const xGridLines = computed(() => displayDays.value.map((_, i) => xScale(i)))
const idealPoints = computed(() => displayDays.value.map((_, i) => [xScale(i), yScale(totalItems.value - (totalItems.value / Math.max(1, sprintDays.value - 1)) * i)]))
const actualPoints = computed(() => [[xScale(0), yScale(totalItems.value)], [xScale(Math.min(displayDays.value.length-1, Math.floor((Date.now() - new Date(selectedSprint.value?.startDate).getTime())/86400000))), yScale(remainingItems.value)]])
const pointsStr = (pts) => pts.map(p => p.join(',')).join(' ')
const areaPath = (pts) => { if (pts.length < 2) return ''; const b = svgH - pad.bottom; return `M ${pts[0][0]},${b} L ${pts.map(p => p.join(',')).join(' L ')} L ${pts[pts.length-1][0]},${b} Z` }
const fetchData = async () => {
  const [sData, iData] = await Promise.all([$fetch(`/api/sprints?projectId=${route.params.id}`), $fetch(`/api/items?projectId=${route.params.id}`)])
  sprints.value = sData; allItems.value = iData
  if (sData.length) { const act = sData.find(s => s.status === 'In Progress') || sData[0]; selectedSprintIdStr.value = String(act.id) }
}

const closeDropdown = (e) => {
  if (!e.target.closest('.custom-dropdown')) showSprintDropdown.value = false
}

onMounted(() => {
  fetchData()
  window.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

const sprintDayRows = computed(() => {
  if (!selectedSprint.value || !sprintItems.value.length) return []
  const s = new Date(selectedSprint.value.startDate); s.setHours(0,0,0,0)
  const rows = []; let run = totalItems.value; const days = Math.min(sprintDays.value, Math.ceil((Date.now() - s.getTime())/86400000)+1)
  for (let i=0; i<days; i++) {
    const d = new Date(s); d.setDate(s.getDate()+i)
    rows.push({ label: d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}), completed: 0, reopened: 0, added: i===0?totalItems.value:0, pending: totalItems.value, isToday: d.toDateString() === new Date().toDateString(), isStart: i===0 })
  }
  return rows.reverse()
})
const activePanel = ref(null); const openPanel = (type, row) => { activePanel.value = { type, row } }
const panelTitle = computed(() => activePanel.value ? (activePanel.value.type === 'completed' ? 'Completed Tasks' : 'Added Tasks') : '')
const panelItems = computed(() => activePanel.value?.type === 'added' ? sprintItems.value : [])
const viewItemDetail = (id) => router.push(`/workspace/projects/${route.params.id}/items/${id}?from=board`)
watch(selectedSprintIdStr, async () => { isLoading.value = true; await new Promise(r => setTimeout(r, 600)); isLoading.value = false })
onMounted(fetchData)
</script>

<style scoped>
.burn-report-container { 
  padding: 2.5rem 1.5rem; 
  background: var(--color-bg-card); 
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 80vh;
}
.report-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.report-title { display: flex; align-items: center; gap: 0.75rem; font-size: 2rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
.report-subtitle { color: var(--color-text-muted); margin: 0.25rem 0 0 2.5rem; font-size: 0.95rem; font-weight: 500; }

.sprint-picker { display: flex; flex-direction: column; gap: 0.5rem; min-width: 250px; }
.sprint-picker label { font-size: 0.7rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding-left: 0.25rem; }

.custom-dropdown { position: relative; width: 100%; z-index: 1000; }
.dropdown-trigger { background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 12px; padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
.dropdown-trigger:hover { border-color: var(--primary-color); box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 5%, transparent); }
.curr-val { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); }
.dropdown-trigger svg { color: var(--color-text-muted); transition: 0.3s; }
.dropdown-trigger svg.rotate { transform: rotate(180deg); color: var(--primary-color); }

.dropdown-menu { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 0.5rem; transform-origin: top; }
.dropdown-item { padding: 0.75rem 0.75rem; border-radius: 10px; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: 0.15s; }
.dropdown-item:hover { background: var(--color-bg-main); }
.dropdown-item.active { background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.s-dot { width: 8px; height: 8px; border-radius: 50%; }
.s-dot.in-progress { background: var(--color-info); }
.s-dot.completed { background: var(--color-success); }
.s-dot.not-started { background: var(--color-border); }
.s-name { flex: 1; font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.s-status { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }

.pop-enter-active, .pop-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.95) translateY(-5px); }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 1.75rem; }
.kpi-card { background: var(--color-bg-card); border-radius: 20px; padding: 1.5rem; border: 1px solid var(--color-border); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.kpi-val { font-size: 2.5rem; font-weight: 900; color: var(--color-text-primary); }
.kpi-card.success .kpi-val { color: var(--color-success); }
.kpi-card.warn .kpi-val { color: var(--color-warning); }
.skel { background: var(--color-border-light); border-radius: 6px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
.skel-label { width: 50%; height: 14px; margin-bottom: 1rem; }
.skel-val { width: 70%; height: 36px; margin-bottom: 0.5rem; }
.skel-sub { width: 40%; height: 12px; }

.chart-card { background: var(--color-bg-card); border-radius: 24px; padding: 2rem; border: 1px solid var(--color-border); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.chart-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); }
.legend { display: flex; gap: 1rem; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); }
.l-dot { width: 10px; height: 10px; border-radius: 50%; }
.l-dot.ideal { background: transparent; border: 2px dashed var(--color-border); }
.l-dot.actual { background: var(--color-success); }

.chart-empty { text-align: center; padding: 4rem; color: var(--color-text-muted); }
.chart-empty p { margin-top: 1rem; font-weight: 500; font-size: 0.95rem; }

.progress-bar-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); }
.progress-label { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; }
.progress-pct { color: var(--color-success); font-weight: 800; }
.progress-track { width: 100%; height: 8px; background: var(--color-bg-main); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-success), var(--primary-color)); border-radius: 99px; transition: width 0.6s ease; }

.skeleton-chart-card { display: flex; justify-content: center; align-items: center; min-height: 400px; }
.shimmer-bar { background: var(--color-border-light); border-radius: 4px; width: 40px; margin: 0 10px; animation: pulse 1.5s infinite; }
.skeleton-chart-inner { width: 100%; }
.skel-chart-title { width: 150px; height: 24px; margin-bottom: 2rem; background: var(--color-border-light); border-radius: 4px; }
.skeleton-chart-area { display: flex; align-items: flex-end; height: 300px; width: 100%; justify-content: space-around; }

.burndown-svg { width: 100%; height: 380px; }
.activity-table-card { background: var(--color-bg-card); border-radius: 24px; padding: 2rem; border: 1px solid var(--color-border); margin-top: 2rem; }

.table-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
.table-header-row h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); }
.table-subtitle { font-size: 0.85rem; color: var(--color-text-muted); font-weight: 500; }

.activity-table { width: 100%; border-collapse: collapse; }
.activity-table th { padding: 1rem; border-bottom: 2px solid var(--color-border); font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em; text-align: center; }
.activity-table td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--color-border-light); text-align: center; font-size: 0.95rem; color: var(--color-text-secondary); font-weight: 500; }
.activity-table .date-cell { text-align: left; font-weight: 700; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.5rem; }

.row-badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 6px; text-transform: uppercase; font-weight: 800; }
.row-badge.start { background: rgba(59, 130, 246, 0.15); color: var(--color-info); }
.row-badge.today { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }

.dash { color: var(--color-text-light); font-weight: 400; }
.activity-btn { border: none; font-weight: 700; cursor: pointer; border-radius: 8px; padding: 0.4rem 0.8rem; transition: 0.2s; }
.activity-btn.completed { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--color-success); }
.activity-btn.reopened { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.activity-btn.added { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
.task-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 500; transition: 0.3s; }
.task-panel { position: absolute; right: 0; top: 0; bottom: 0; width: 480px; background: var(--color-bg-card); border-left: 1px solid var(--color-border); box-shadow: -10px 0 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

.panel-header { padding: 2.5rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: flex-start; }
.panel-category { font-size: 0.7rem; font-weight: 800; color: var(--color-success); letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem; }
.panel-header h3 { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
.panel-date { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
.panel-close-btn { background: var(--color-bg-main); border: none; width: 40px; height: 40px; border-radius: 50%; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.panel-close-btn:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

.panel-body { flex: 1; overflow-y: auto; padding: 1.5rem 2rem; }
.panel-empty-state { text-align: center; padding: 4rem 2rem; color: var(--color-text-light); }
.empty-icon-wrap { margin-bottom: 1rem; opacity: 0.5; }

.panel-task-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem; cursor: pointer; transition: 0.2s; display: flex; gap: 1.25rem; align-items: center; }
.panel-task-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
.task-card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.task-card-icon.bug { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.task-card-icon.story { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--color-success); }
.task-card-icon.task { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }

.task-card-content { flex: 1; min-width: 0; }
.task-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
.task-uid-label { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); }
.task-status-pill { font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; text-transform: uppercase; }
.task-status-pill.completed { background: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--color-success); }
.task-status-pill.to-do { background: var(--color-bg-main); color: var(--color-text-muted); }
.task-status-pill.in-progress { background: rgba(59, 130, 246, 0.2); color: var(--color-info); }

.task-card-title { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-card-arrow { color: var(--color-border); }
.panel-task-card:hover .task-card-arrow { color: var(--color-success); }

.panel-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--color-border-light); }
.btn-panel-dismiss { width: 100%; background: var(--color-text-primary); color: var(--color-bg-card); border: none; padding: 1rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-panel-dismiss:hover { opacity: 0.9; }

.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-text-light); }

.reveal { animation: revealUp 0.4s ease both; }
@keyframes revealUp { from { opacity: 0; transform: translateY(10px); } }
</style>
