<template>
  <div class="dash" :style="{ '--pc': primaryColor }">

    <!-- ── Header ── -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Good {{ greeting }}, {{ user?.name?.split(' ')[0] }} 👋</h1>
        <p class="dash-sub">Here's what's happening across your workspace today.</p>
      </div>
      <div class="dash-date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {{ todayLabel }}
      </div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-row">
      <div class="kpi kpi-accent">
        <div class="kpi-left">
          <span class="kpi-label">Total Projects</span>
          <span class="kpi-val">{{ projects.length }}</span>
          <span class="kpi-sub">All time</span>
        </div>
        <div class="kpi-icon-wrap" style="background:rgba(255,255,255,0.18)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-left">
          <span class="kpi-label">Active Projects</span>
          <span class="kpi-val">{{ projects.filter(p => p.status === 'Active').length }}</span>
          <span class="kpi-sub">Currently running</span>
        </div>
        <div class="kpi-icon-wrap kpi-icon-wrap--blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-left">
          <span class="kpi-label">Total Items</span>
          <span class="kpi-val">{{ items.length }}</span>
          <span class="kpi-sub">Tasks, Stories & Bugs</span>
        </div>
        <div class="kpi-icon-wrap kpi-icon-wrap--purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-left">
          <span class="kpi-label">Team Members</span>
          <span class="kpi-val">{{ users.filter(u => u.is_active).length }}</span>
          <span class="kpi-sub">Active users</span>
        </div>
        <div class="kpi-icon-wrap kpi-icon-wrap--yellow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
      </div>
    </div>

    <!-- ── Row 2: Bar Chart + Doughnut ── -->
    <div class="grid-2-1">
      <div class="card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Project Activity</h3>
            <p class="card-sub">Items created per month this year</p>
          </div>
          <div class="legend-row">
            <span class="leg"><span class="leg-dot" :style="{background: primaryColor}"></span>Items</span>
            <span class="leg"><span class="leg-dot" style="background:#E2E8F0"></span>Sprints</span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="barCanvas"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Project Status</h3>
            <p class="card-sub">Distribution by status</p>
          </div>
        </div>
        <div class="donut-wrap">
          <canvas ref="donutCanvas"></canvas>
          <div class="donut-center">
            <span class="donut-num">{{ projects.length }}</span>
            <span class="donut-lbl">Total</span>
          </div>
        </div>
        <div class="donut-legend">
          <div v-for="s in projectStatusBreakdown" :key="s.label" class="donut-leg-item">
            <span class="leg-dot" :style="{background: s.color}"></span>
            <span class="leg-text">{{ s.label }}</span>
            <span class="leg-count">{{ s.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 3: Line Chart + Pie Chart ── -->
    <div class="grid-1-1">
      <div class="card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Items by Priority</h3>
            <p class="card-sub">High · Medium · Low breakdown per month</p>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="lineCanvas"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Item Types</h3>
            <p class="card-sub">Story · Task · Bug split</p>
          </div>
        </div>
        <div class="pie-wrap">
          <canvas ref="pieCanvas"></canvas>
        </div>
        <div class="donut-legend">
          <div v-for="t in itemTypeBreakdown" :key="t.label" class="donut-leg-item">
            <span class="leg-dot" :style="{background: t.color}"></span>
            <span class="leg-text">{{ t.label }}</span>
            <span class="leg-count">{{ t.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 4: Recent Projects + Sprint Overview ── -->
    <div class="grid-2-1">
      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Recent Projects</h3>
          <NuxtLink to="/workspace/projects" class="see-all">See all →</NuxtLink>
        </div>
        <div v-if="projects.length === 0" class="empty-hint">No projects yet.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in projects.slice(0, 6)" :key="p.id">
              <td>
                <div class="proj-cell">
                  <img v-if="p.logo_url" :src="p.logo_url" class="proj-logo" />
                  <span v-else class="proj-logo-ph" :style="{background: primaryColor}">{{ p.name?.[0] }}</span>
                  <span class="proj-name">{{ p.name }}</span>
                </div>
              </td>
              <td><span class="badge" :style="statusStyle(p.status)">{{ p.status }}</span></td>
              <td class="muted">{{ fmtDate(p.start_date) }}</td>
              <td class="muted">{{ fmtDate(p.end_date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Sprint Overview</h3>
        </div>
        <div v-if="sprints.length === 0" class="empty-hint">No sprints yet.</div>
        <div v-else class="sprint-list">
          <div v-for="s in sprints.slice(0, 6)" :key="s.id" class="sprint-row">
            <div class="sprint-info">
              <span class="sprint-name">{{ s.name }}</span>
              <span class="muted" style="font-size:0.75rem">{{ projectName(s.projectId) }}</span>
            </div>
            <span class="badge" :style="sprintStyle(s.status)">{{ s.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 5: Recent Items + Team Members ── -->
    <div class="grid-1-1">
      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Recent Items</h3>
        </div>
        <div v-if="items.length === 0" class="empty-hint">No items yet.</div>
        <div v-else class="item-list">
          <div v-for="item in items.slice(0, 7)" :key="item.id" class="item-row">
            <span class="type-chip" :class="(item.type || 'Task').toLowerCase()">{{ item.type || 'Task' }}</span>
            <div class="item-meta">
              <span class="item-title">{{ item.title }}</span>
              <span class="muted" style="font-size:0.72rem">{{ item.uid }}</span>
            </div>
            <span class="priority-dot" :class="(item.priority || 'Medium').toLowerCase()"></span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Team Members</h3>
          <NuxtLink to="/workspace/users" class="see-all">See all →</NuxtLink>
        </div>
        <div v-if="users.length === 0" class="empty-hint">No users yet.</div>
        <div v-else class="member-list">
          <div v-for="u in users.slice(0, 6)" :key="u.id" class="member-row">
            <img :src="avatarUrl(u)" class="m-avatar" />
            <div class="m-info">
              <span class="m-name">{{ u.name }}</span>
              <span class="muted" style="font-size:0.75rem">{{ u.email }}</span>
            </div>
            <span class="status-pill" :class="u.is_active ? 'active' : 'inactive'">{{ u.is_active ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Chart,
  BarElement, BarController,
  LineElement, LineController, PointElement,
  ArcElement, DoughnutController, PieController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(
  BarElement, BarController,
  LineElement, LineController, PointElement,
  ArcElement, DoughnutController, PieController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
)

definePageMeta({ layout: 'default', middleware: 'auth' })

// ── Auth & Color ───────────────────────────────────────
const { user } = useAuth()
const { settings: appSettings } = useSettings()
const primaryColor = ref(appSettings.value.colorScheme || '#10B981')

// ── State ──────────────────────────────────────────────
const projects = ref<any[]>([])
const items    = ref<any[]>([])
const sprints  = ref<any[]>([])
const users    = ref<any[]>([])

// ── Chart Canvas Refs ──────────────────────────────────
const barCanvas   = ref<HTMLCanvasElement | null>(null)
const donutCanvas = ref<HTMLCanvasElement | null>(null)
const lineCanvas  = ref<HTMLCanvasElement | null>(null)
const pieCanvas   = ref<HTMLCanvasElement | null>(null)

let barChart:   Chart | null = null
let donutChart: Chart | null = null
let lineChart:  Chart | null = null
let pieChart:   Chart | null = null

// ── Helpers ────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const fmtDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const projectName = (id: number) => projects.value.find(p => p.id === id)?.name || '—'

const avatarUrl = (u: any) =>
  u?.profile_photo
    ? u.profile_photo
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=${primaryColor.value.replace('#','')}&color=fff&size=80`

const statusStyle = (s: string) => {
  const map: Record<string, any> = {
    'Active':      { background:'color-mix(in srgb, #16A34A 15%, transparent)', color:'#16A34A' },
    'Completed':   { background:'color-mix(in srgb, #64748B 15%, transparent)', color:'#64748B' },
    'On Hold':     { background:'color-mix(in srgb, #CA8A04 15%, transparent)', color:'#CA8A04' },
    'Planning':    { background:'color-mix(in srgb, #3B82F6 15%, transparent)', color:'#3B82F6' },
    'Cancelled':   { background:'color-mix(in srgb, #DC2626 15%, transparent)', color:'#DC2626' },
    'In Progress': { background:'color-mix(in srgb, #3B82F6 15%, transparent)', color:'#3B82F6' },
  }
  return map[s] || { background:'color-mix(in srgb, #6B7280 15%, transparent)', color:'#6B7280' }
}

const sprintStyle = (s: string) => {
  const map: Record<string, any> = {
    'Not Started': { background:'color-mix(in srgb, #64748B 15%, transparent)', color:'#64748B' },
    'In Progress': { background:'color-mix(in srgb, #2563EB 15%, transparent)', color:'#2563EB' },
    'Completed':   { background:'color-mix(in srgb, #16A34A 15%, transparent)', color:'#16A34A' },
    'Planned':     { background:'color-mix(in srgb, #7C3AED 15%, transparent)', color:'#7C3AED' },
  }
  return map[s] || { background:'color-mix(in srgb, #6B7280 15%, transparent)', color:'#6B7280' }
}

// ── Computed Chart Data ────────────────────────────────
const itemsPerMonth = computed(() => {
  const c = Array(12).fill(0)
  items.value.forEach((it: any) => { const m = new Date(it.createdAt).getMonth(); if (!isNaN(m)) c[m]++ })
  return c
})

const sprintsPerMonth = computed(() => {
  const c = Array(12).fill(0)
  sprints.value.forEach((s: any) => { const m = new Date(s.createdAt).getMonth(); if (!isNaN(m)) c[m]++ })
  return c
})

const projectStatusBreakdown = computed(() => {
  const map: Record<string, number> = {}
  projects.value.forEach(p => { const k = p.status || 'Unknown'; map[k] = (map[k] || 0) + 1 })
  const COLORS = [primaryColor.value,'#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#64748B']
  return Object.entries(map).map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }))
})

const itemTypeBreakdown = computed(() => {
  const map: Record<string, number> = { Story: 0, Task: 0, Bug: 0 }
  items.value.forEach((it: any) => { const t = it.type || 'Task'; map[t] = (map[t] || 0) + 1 })
  return [
    { label: 'Story', value: map['Story'], color: primaryColor.value },
    { label: 'Task',  value: map['Task'],  color: '#3B82F6' },
    { label: 'Bug',   value: map['Bug'],   color: '#EF4444' },
  ]
})

const priorityByMonth = computed(() => {
  const high = Array(12).fill(0), med = Array(12).fill(0), low = Array(12).fill(0)
  items.value.forEach((it: any) => {
    const m = new Date(it.createdAt).getMonth()
    if (isNaN(m)) return
    if (it.priority === 'High') high[m]++
    else if (it.priority === 'Low') low[m]++
    else med[m]++
  })
  return { high, med, low }
})

// ── Fetch ──────────────────────────────────────────────
const fetchAll = async () => {
  const [pRes, iRes, sRes, uRes, settRes] = await Promise.allSettled([
    $fetch<any[]>('/api/projects'),
    $fetch<any[]>('/api/items'),
    $fetch<any[]>('/api/sprints'),
    $fetch<any[]>('/api/users'),
    $fetch<any>('/api/settings'),
  ])
  if (pRes.status === 'fulfilled') projects.value = pRes.value
  if (iRes.status === 'fulfilled') items.value    = iRes.value
  if (sRes.status === 'fulfilled') sprints.value  = sRes.value
  if (uRes.status === 'fulfilled') users.value    = uRes.value
  if (settRes.status === 'fulfilled' && settRes.value?.colorScheme)
    primaryColor.value = settRes.value.colorScheme
}

// ── Build Charts ───────────────────────────────────────
const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

const buildCharts = () => {
  const pc = primaryColor.value
  // Read theme-aware grid color from CSS variable at runtime
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border-light').trim() || '#F1F5F9'
  const tickColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-light').trim() || '#9CA3AF'

  // ── Bar ──
  if (barCanvas.value) {
    barChart?.destroy()
    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: 'Items',
            data: itemsPerMonth.value,
            backgroundColor: hexToRgba(pc, 0.85),
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Sprints',
            data: sprintsPerMonth.value,
            backgroundColor: '#E2E8F0',
            borderRadius: 6,
            borderSkipped: false,
          },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, border: { display: false }, ticks: { stepSize: 1, precision: 0, color: tickColor } }
        }
      }
    })
  }

  // ── Doughnut ──
  if (donutCanvas.value) {
    donutChart?.destroy()
    const bd = projectStatusBreakdown.value
    donutChart = new Chart(donutCanvas.value, {
      type: 'doughnut',
      data: {
        labels: bd.length ? bd.map(b => b.label) : ['No Data'],
        datasets: [{
          data: bd.length ? bd.map(b => b.value) : [1],
          backgroundColor: bd.length ? bd.map(b => b.color) : [gridColor],
          borderWidth: 3, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-card').trim() || '#fff', hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { enabled: bd.length > 0 } }
      }
    })
  }

  // ── Line ──
  if (lineCanvas.value) {
    lineChart?.destroy()
    const { high, med, low } = priorityByMonth.value
    lineChart = new Chart(lineCanvas.value, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          { label: 'High',   data: high, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)',   tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
          { label: 'Medium', data: med,  borderColor: pc,        backgroundColor: hexToRgba(pc, 0.08),      tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
          { label: 'Low',    data: low,  borderColor: '#94A3B8', backgroundColor: 'rgba(148,163,184,0.08)', tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { boxWidth: 10, padding: 16, font: { size: 12 }, color: tickColor } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, border: { display: false }, ticks: { stepSize: 1, precision: 0, color: tickColor } }
        }
      }
    })
  }

  // ── Pie ──
  if (pieCanvas.value) {
    pieChart?.destroy()
    const td = itemTypeBreakdown.value
    const hasData = td.some(t => t.value > 0)
    pieChart = new Chart(pieCanvas.value, {
      type: 'pie',
      data: {
        labels: td.map(t => t.label),
        datasets: [{
          data: hasData ? td.map(t => t.value) : [1, 1, 1],
          backgroundColor: hasData ? td.map(t => t.color) : [gridColor, gridColor, gridColor],
          borderWidth: 3, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-card').trim() || '#fff', hoverOffset: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: hasData } }
      }
    })
  }
}

onMounted(async () => {
  await fetchAll()
  await nextTick()
  buildCharts()
})
</script>

<style scoped>
.dash {
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header */
.dash-header { display: flex; justify-content: space-between; align-items: center; }
.dash-title  { font-size: 1.85rem; font-weight: 900; color: var(--color-text-primary); letter-spacing: -0.04em; margin: 0 0 0.35rem; }
.dash-sub    { color: var(--color-text-muted); font-size: 0.95rem; margin: 0; }
.dash-date   {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; font-weight: 600; color: var(--color-text-light);
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  padding: 0.5rem 1rem; border-radius: 10px;
}

/* KPI */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.kpi {
  background: var(--color-bg-card); border: 1.5px solid var(--color-border-light); border-radius: 20px;
  padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
  transition: box-shadow 0.2s;
}
.kpi:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.kpi-accent { background: var(--pc); border-color: var(--pc); }
.kpi-accent .kpi-label,
.kpi-accent .kpi-val,
.kpi-accent .kpi-sub { color: rgba(255,255,255,0.9) !important; }
.kpi-left    { display: flex; flex-direction: column; gap: 0.35rem; }
.kpi-label   { font-size: 0.75rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.06em; }
.kpi-val     { font-size: 2.25rem; font-weight: 900; color: var(--color-text-primary); letter-spacing: -0.04em; line-height: 1; }
.kpi-sub     { font-size: 0.78rem; font-weight: 600; color: var(--color-text-light); }
.kpi-icon-wrap {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* Grid layouts */
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }
.grid-1-1 { display: grid; grid-template-columns: 1fr 1fr;  gap: 1.25rem; }

/* Card */
.card {
  background: var(--color-bg-card); border: 1.5px solid var(--color-border-light); border-radius: 20px;
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;
}
.card-head  { display: flex; justify-content: space-between; align-items: flex-start; }
.card-title { font-size: 1rem; font-weight: 850; color: var(--color-text-primary); margin: 0; }
.card-sub   { font-size: 0.8rem; color: var(--color-text-light); margin: 0.2rem 0 0; }

/* Legend */
.legend-row { display: flex; gap: 1rem; align-items: center; }
.leg        { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600; }
.leg-dot    { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

/* Charts */
.chart-wrap { height: 220px; position: relative; }
.donut-wrap { height: 200px; position: relative; display: flex; align-items: center; justify-content: center; }
.pie-wrap   { height: 200px; position: relative; }
.donut-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
}
.donut-num  { font-size: 2rem; font-weight: 900; color: var(--color-text-primary); letter-spacing: -0.04em; }
.donut-lbl  { font-size: 0.72rem; font-weight: 600; color: var(--color-text-light); }
.donut-legend    { display: flex; flex-direction: column; gap: 0.5rem; }
.donut-leg-item  { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; }
.leg-text   { flex: 1; color: var(--color-text-secondary); font-weight: 600; }
.leg-count  { font-weight: 800; color: var(--color-text-primary); }

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 0.55rem 0.75rem;
  font-size: 0.7rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1.5px solid var(--color-border-light);
}
.data-table td { padding: 0.7rem 0.75rem; font-size: 0.85rem; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border-light); }
.data-table tr:last-child td { border-bottom: none; }
.proj-cell  { display: flex; align-items: center; gap: 0.65rem; }
.proj-logo  { width: 28px; height: 28px; border-radius: 8px; object-fit: cover; }
.proj-logo-ph {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 800; color: #fff;
}
.proj-name { font-weight: 700; color: var(--color-text-primary); font-size: 0.87rem; }

/* Badge */
.badge {
  display: inline-block; padding: 0.22rem 0.55rem;
  border-radius: 6px; font-size: 0.7rem; font-weight: 700; white-space: nowrap;
}

/* See all */
.see-all { font-size: 0.8rem; font-weight: 700; color: var(--pc); text-decoration: none; }
.see-all:hover { text-decoration: underline; }

/* Sprints */
.sprint-list { display: flex; flex-direction: column; }
.sprint-row  {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 0; border-bottom: 1px solid var(--color-border-light);
}
.sprint-row:last-child { border-bottom: none; }
.sprint-info { display: flex; flex-direction: column; gap: 0.15rem; }
.sprint-name { font-size: 0.87rem; font-weight: 700; color: var(--color-text-primary); }

/* Items */
.item-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.6rem 0.75rem; border-radius: 10px; background: var(--color-bg-main);
  transition: background 0.15s;
}
.item-row:hover { background: var(--color-border-light); }
.item-meta  { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.item-title { font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); }
.type-chip {
  font-size: 0.68rem; font-weight: 800; padding: 0.18rem 0.45rem;
  border-radius: 5px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
}
.type-chip.story { background: color-mix(in srgb, #16A34A 15%, transparent); color: #16A34A; }
.type-chip.task  { background: color-mix(in srgb, #2563EB 15%, transparent); color: #2563EB; }
.type-chip.bug   { background: color-mix(in srgb, #DC2626 15%, transparent); color: #DC2626; }
.priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.priority-dot.high   { background: #EF4444; }
.priority-dot.medium { background: #F59E0B; }
.priority-dot.low    { background: #94A3B8; }

/* Members */
.member-list { display: flex; flex-direction: column; }
.member-row  {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.6rem 0; border-bottom: 1px solid var(--color-border-light);
}
.member-row:last-child { border-bottom: none; }
.m-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.m-info   { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.m-name   { font-size: 0.87rem; font-weight: 700; color: var(--color-text-primary); }
.status-pill {
  font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 20px; flex-shrink: 0;
}
.status-pill.active   { background: color-mix(in srgb, #16A34A 15%, transparent); color: #16A34A; }
.status-pill.inactive { background: color-mix(in srgb, #DC2626 15%, transparent); color: #DC2626; }

/* Utility */
.muted      { color: var(--color-text-muted); }
.empty-hint { text-align: center; padding: 2.5rem; color: var(--color-text-light); font-size: 0.875rem; }

/* KPI icon backgrounds — theme-aware tints */
.kpi-icon-wrap--blue   { background: color-mix(in srgb, #3B82F6 18%, transparent); }
.kpi-icon-wrap--purple { background: color-mix(in srgb, #7C3AED 18%, transparent); }
.kpi-icon-wrap--yellow { background: color-mix(in srgb, #CA8A04 18%, transparent); }

/* Responsive */
@media (max-width: 1100px) {
  .kpi-row   { grid-template-columns: repeat(2, 1fr); }
  .grid-2-1  { grid-template-columns: 1fr; }
  .grid-1-1  { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .kpi-row   { grid-template-columns: 1fr; }
  .dash      { padding: 1rem 1.25rem; }
}
</style>
