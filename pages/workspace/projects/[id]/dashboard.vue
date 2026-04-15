<template>
  <div class="project-dashboard-content reveal-container">
    <!-- Sprint Stats Grid -->
    <div class="dashboard-stats-grid">
      <div v-if="loading" v-for="i in 4" :key="i" class="stat-card skeleton">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text">
          <div class="sk-label"></div>
          <div class="sk-val"></div>
        </div>
      </div>
      
      <template v-else>
        <div class="stat-card reveal" style="--d:0ms">
          <div class="stat-icon-bg total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-info">
            <label>Total Sprints</label>
            <h3>{{ sprintStats.total }}</h3>
          </div>
        </div>
        
        <div class="stat-card reveal" style="--d:100ms">
          <div class="stat-icon-bg active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="stat-info">
            <label>Active Sprints</label>
            <h3 class="text-emerald">{{ sprintStats.active }}</h3>
          </div>
        </div>

        <div class="stat-card reveal" style="--d:200ms">
          <div class="stat-icon-bg upcoming">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <label>Upcoming</label>
            <h3>{{ sprintStats.upcoming }}</h3>
          </div>
        </div>

        <div class="stat-card reveal" style="--d:300ms">
          <div class="stat-icon-bg completed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
          </div>
          <div class="stat-info">
            <label>Completed</label>
            <h3>{{ sprintStats.completed }}</h3>
          </div>
        </div>
      </template>
    </div>

    <!-- Secondary Row: Distribution & Progress -->
    <div class="dashboard-main-row mt-3">
      <!-- Item Distribution Card -->
      <div class="distribution-card reveal" style="--d:400ms">
        <div class="card-p-header">
           <h4 class="card-p-title">Item Distribution</h4>
           <span class="card-p-sub">Breakdown of bugs, tasks and stories</span>
        </div>
        <div class="dist-content-wrap">
           <div class="segmented-progress-bar" v-if="!loading">
              <div class="seg bug" :style="{ width: itemStats.bugPct + '%' }" :title="itemStats.bugPct + '% Bugs'"></div>
              <div class="seg task" :style="{ width: itemStats.taskPct + '%' }" :title="itemStats.taskPct + '% Tasks'"></div>
              <div class="seg story" :style="{ width: itemStats.storyPct + '%' }" :title="itemStats.storyPct + '% User Stories'"></div>
           </div>
           
           <div class="legend-list mt-3">
              <div class="legend-item">
                 <div class="legend-icon bug">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="13" r="6"></circle><path d="M12 7V3M8 3l1.5 3M16 3l-1.5 3"></path></svg>
                 </div>
                 <span class="l-name">Bugs</span>
                 <span class="l-val">{{ itemStats.bugPct }}%</span>
              </div>
              <div class="legend-item">
                 <div class="legend-icon task">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                 </div>
                 <span class="l-name">Tasks</span>
                 <span class="l-val">{{ itemStats.taskPct }}%</span>
              </div>
              <div class="legend-item">
                 <div class="legend-icon story">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                 </div>
                 <span class="l-name">User Stories</span>
                 <span class="l-val">{{ itemStats.storyPct }}%</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Velocity Chart -->
      <div class="info-place-card reveal" style="--d:500ms">
         <div class="card-p-header">
            <h4 class="card-p-title">Velocity Overview</h4>
            <span class="card-p-sub">Historical output per sprint</span>
         </div>
         <div v-if="loading" class="skeleton-chart-placeholder"></div>
         <template v-else>
           <div class="velocity-dummy-chart">
              <div class="bar-pair" v-for="s in recentSprints" :key="s.id">
                 <div class="bar" :style="{ height: getVelocityHeight(s) + '%' }"></div>
              </div>
           </div>
           <div class="chart-labels">
              <span v-for="s in recentSprints" :key="s.id">{{ getShortName(s.name) }}</span>
           </div>
         </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const route = useRoute()
const sprints = ref<any[]>([])
const items = ref<any[]>([])
const loading = ref(true)

const sprintStats = computed(() => ({
  total: sprints.value.length,
  active: sprints.value.filter(s => s.status === 'In Progress').length,
  upcoming: sprints.value.filter(s => s.status === 'Planning' || s.status === 'Not Started').length,
  completed: sprints.value.filter(s => s.status === 'Completed').length
}))

const itemStats = computed(() => {
  const total = items.value.length
  if (!total) return { bugPct: 0, taskPct: 0, storyPct: 0 }
  const bugs = items.value.filter(i => i.type === 'Bug').length
  const tasks = items.value.filter(i => i.type === 'Task').length
  const stories = items.value.filter(i => i.type === 'Story').length
  return {
    bugPct: Math.round((bugs / total) * 100),
    taskPct: Math.round((tasks / total) * 100),
    storyPct: Math.round((stories / total) * 100)
  }
})

const recentSprints = computed(() => {
  return sprints.value.slice(-5)
})

const getShortName = (name: string) => {
  const match = name.match(/Sprint\s+(\d+)/i)
  return match ? `S${match[1]}` : name.substring(0, 3).toUpperCase()
}

const getVelocityHeight = (s: any) => {
  // Mock velocity logic based on items in sprint
  const sItems = items.value.filter(i => i.sprintId === s.id).length
  return Math.min(100, Math.max(20, sItems * 15))
}

const fetchData = async () => {
  loading.value = true
  try {
    const [sData, iData] = await Promise.all([
      $fetch<any[]>(`/api/sprints?projectId=${route.params.id}`),
      $fetch<any[]>(`/api/items?projectId=${route.params.id}`)
    ])
    sprints.value = sData
    items.value = iData
  } catch (e) {
    console.error('Failed to fetch dashboard data', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.project-dashboard-content { 
  padding: 2.5rem 1.5rem; 
  background: var(--color-bg-card); 
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 80vh;
}

.dashboard-stats-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 1.5rem; 
}

.stat-card { 
  background: var(--color-bg-card); 
  border: 1px solid var(--color-border-light); 
  border-radius: 20px; 
  padding: 1.5rem; 
  display: flex; 
  align-items: center; 
  gap: 1.25rem; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-3px); border-color: var(--color-border); }

.stat-icon-bg { 
  width: 50px; 
  height: 50px; 
  border-radius: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: white; 
}
.stat-icon-bg.total { background: #6366F1; box-shadow: 0 5px 15px rgba(99,102,241,0.2); }
.stat-icon-bg.active { background: var(--primary-color); box-shadow: 0 5px 15px color-mix(in srgb, var(--primary-color) 20%, transparent); }
.stat-icon-bg.upcoming { background: #F59E0B; box-shadow: 0 5px 15px rgba(245,158,11,0.2); }
.stat-icon-bg.completed { background: var(--color-text-light); box-shadow: 0 5px 15px rgba(55,65,81,0.2); }

.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-info label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-info h3 { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.text-emerald { color: var(--primary-color) !important; }

.dashboard-main-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
.mt-3 { margin-top: 2.5rem; }

.distribution-card, .info-place-card { 
  background: var(--color-bg-card); 
  border: 1px solid var(--color-border-light); 
  border-radius: 24px; 
  padding: 2rem; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.02); 
}

.card-p-header { margin-bottom: 2rem; }
.card-p-title { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; letter-spacing: -0.02em; }
.card-p-sub { font-size: 0.85rem; color: var(--color-text-light); font-weight: 500; }

.segmented-progress-bar { 
  height: 24px; 
  border-radius: 99px; 
  overflow: hidden; 
  display: flex; 
  background: var(--color-border-light); 
}
.seg.bug { background: #EF4444; }
.seg.task { background: var(--primary-color); }
.seg.story { background: #6366F1; }

.legend-list { display: flex; flex-direction: column; gap: 1rem; }
.legend-item { display: flex; align-items: center; gap: 1rem; }
.legend-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.legend-icon.bug { background: #FEF2F2; color: #EF4444; }
.legend-icon.task { background: color-mix(in srgb, var(--primary-color) 10%, transparent); color: var(--primary-color); }
.legend-icon.story { background: #EFF6FF; color: #6366F1; }
.l-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted); flex: 1; }
.l-val { font-size: 0.9rem; font-weight: 800; color: var(--color-text-secondary); }

.velocity-dummy-chart { 
  height: 120px; 
  display: flex; 
  align-items: flex-end; 
  justify-content: space-around; 
  padding: 0 1rem; 
  border-bottom: 1px solid var(--color-border-light); 
}
.bar { width: 40px; background: var(--color-border); border-radius: 8px 8px 0 0; transition: all 0.3s; }
.bar:hover { background: var(--primary-color); cursor: pointer; }
.chart-labels { display: flex; justify-content: space-around; padding: 0.75rem 1rem 0 1rem; color: var(--color-text-light); font-size: 0.7rem; font-weight: 800; }

/* Skeleton Loaders */
.stat-card.skeleton { background: var(--color-bg-card); border-color: var(--color-bg-main); box-shadow: none; pointer-events: none; }
.skeleton-icon { width: 50px; height: 50px; border-radius: 14px; background: var(--color-border-light); animation: pulse 1.5s infinite; }
.sk-label { width: 60px; height: 10px; background: var(--color-border-light); border-radius: 4px; margin-bottom: 0.5rem; animation: pulse 1.5s infinite; }
.sk-val { width: 30px; height: 18px; background: var(--color-border-light); border-radius: 4px; animation: pulse 1.5s infinite; }
.skeleton-chart-placeholder { height: 120px; background: var(--color-bg-main); border-radius: 12px; animation: pulse 1.5s infinite; }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

/* Reveal Animations */
.reveal { animation: revealUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--d); }
@keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
