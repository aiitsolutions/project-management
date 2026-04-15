<template>
  <div class="dashboard-content-full" :style="{ '--primary-color': primaryColor }">
    <div class="breadcrumb-container">
      <NuxtLink to="/workspace/projects" class="breadcrumb-link">Projects</NuxtLink>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      <NuxtLink :to="`/workspace/projects/${route.params.id}`" class="breadcrumb-link breadcrumb-project">{{ projectData?.name || 'Loading...' }}</NuxtLink>
      
      <template v-if="activeTabName">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <NuxtLink v-if="activeTabPath" :to="activeTabPath" class="breadcrumb-link">{{ activeTabName }}</NuxtLink>
        <span v-else class="breadcrumb-current">{{ activeTabName }}</span>
      </template>

      <template v-if="itemTitle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <span class="breadcrumb-current title-truncate">{{ itemTitle }}</span>
      </template>
    </div>

<!-- Project Navigation Area -->
    <div class="project-board-outer">
      <div class="project-board-view" v-if="projectData">
         <!-- Tab Navigation Bar -->
         <div class="project-view-tabs">
            <NuxtLink 
              v-for="sub in tabOptions" 
              :key="sub.path"
              class="view-tab-btn"
              :class="{ 'active': currentSubPath === sub.path }"
              :to="`/workspace/projects/${route.params.id}${sub.path}`"
            >
              {{ sub.name }}
              <span class="active-bar" v-if="currentSubPath === sub.path"></span>
            </NuxtLink>
         </div>

<!-- Content Switching Area via NuxtPage -->
           <div class="tab-view-content" :key="route.params.id">
              <NuxtPage :transition="{ name: 'tab-fade', mode: 'out-in' }" />
           </div>
      </div>
      
      <div class="empty-state" v-else-if="loading">
         <div class="loading-spinner-small"></div>
         <p>Syncing project...</p>
      </div>
      
      <div class="empty-state" v-else>
         <h2 class="text-xl font-bold mb-2">Project Not Found</h2>
         <p class="text-gray">Please return to the projects list.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const itemTitle = ref('')

// Fetch project data
const { data: projectData, pending: loading, execute: fetchProject } = useFetch(`/api/projects`, {
  query: computed(() => ({ id: route.params.id })),
  immediate: false
})

const project = computed(() => projectData.value)

// Also fetch settings
const { data: settingsData } = useFetch('/api/settings', { immediate: true })
const primaryColor = ref('#10B981')
watch(settingsData, (data) => {
  if (data?.colorScheme) {
    primaryColor.value = data.colorScheme
  }
})

provide('itemTitle', itemTitle)
provide('primaryColor', primaryColor)

onMounted(() => {
  setTimeout(() => {
    fetchProject()
  }, 50)
})

watch(() => route.params.id, () => {
  setTimeout(() => {
    fetchProject()
  }, 50)
})

const tabOptions = [
  { name: 'Project Details', path: '' },
  { name: 'Project Dashboard', path: '/dashboard' },
  { name: 'Backlog and Sprint', path: '/backlog' },
  { name: 'Epics', path: '/epics' },
  { name: 'Board', path: '/sprints' },
  { name: 'Release', path: '/release' },
  { name: 'Burn Report', path: '/items' },
  { name: 'Timesheet', path: '/timesheet' }
]

const currentSubPath = computed(() => {
  const full = route.path
  const base = `/workspace/projects/${route.params.id}`
  const sub = full.replace(base, '')
  
  if (sub.startsWith('/items/')) {
    if (route.query.from === 'board') return '/sprints'
    return '/backlog'
  }
  
  return sub === '/' ? '' : sub
})

const activeTabName = computed(() => {
  if (route.path.includes('/items/')) {
    if (route.query.from === 'board') return 'Board'
    return 'Backlog'
  }
  const sub = tabOptions.find(t => t.path === currentSubPath.value)
  return sub ? sub.name : ''
})

const activeTabPath = computed(() => {
  if (route.path.includes('/items/')) {
    if (route.query.from === 'board') return `/workspace/projects/${route.params.id}/sprints`
    return `/workspace/projects/${route.params.id}/backlog`
  }
  return null
})

const navigateToProject = (id: string | number) => {
  navigateTo(`/workspace/projects/${id}`)
}
</script>

<style scoped>
.breadcrumb-container { display: flex; align-items: center; gap: 0.5rem; padding: 0 1rem; margin-bottom: 2rem; }
.breadcrumb-link { color: var(--color-text-muted); font-size: 0.85rem; font-weight: 500; text-decoration: none; transition: color 0.2s; }
.breadcrumb-link:hover { color: var(--color-text-primary); }
.breadcrumb-current { color: var(--color-text-primary); font-size: 0.85rem; font-weight: 600; }
.breadcrumb-project { color: var(--color-text-secondary) !important; font-weight: 600 !important; }
.breadcrumb-project:hover { color: var(--primary-color) !important; }
.title-truncate { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.project-board-view { background: var(--color-bg-card); border-radius: 16px; box-shadow: var(--shadow-lg); display: flex; flex-direction: column; overflow: visible !important; }

.project-view-tabs { display: flex; align-items: center; gap: 1rem; padding: 0 1.5rem; border-bottom: 1px solid var(--color-border); background: var(--color-bg-card); overflow: visible !important; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
.view-tab-btn { background: none; border: none; padding: 1.25rem 0.75rem; font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); cursor: pointer; position: relative; transition: all 0.2s; white-space: nowrap; text-decoration: none; }
.view-tab-btn:hover { color: var(--color-text-primary); }
.view-tab-btn.active { color: var(--primary-color); }
.active-bar { position: absolute; bottom: 0; left: 0.75rem; right: 0.75rem; height: 3px; background: var(--primary-color); border-radius: 3px 3px 0 0; }

.tab-view-content { padding: 0; min-height: 500px; background: var(--color-bg-main); overflow: visible !important; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }

.loading-spinner-small { width: 24px; height: 24px; border: 2px solid var(--color-border); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 4rem; color: var(--color-text-muted); font-size: 1rem; }
.font-bold { font-weight: 700; color: var(--color-text-primary); }
.mb-2 { margin-bottom: 0.5rem; }
.text-xl { font-size: 1.5rem; }

/* TAB TRANSITION */
.tab-fade-enter-active, .tab-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
