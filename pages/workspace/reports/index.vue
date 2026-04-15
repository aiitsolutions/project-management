<template>
  <div class="reports-page">
    <header class="page-header">
      <div class="header-titles">
        <h1>Reports</h1>
        <p>View and analyze project performance data.</p>
      </div>
    </header>

    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>Select Project</label>
          <div class="select-wrapper">
            <select v-model="selectedProjectId" class="filter-select" @change="onProjectChange">
              <option :value="null">All Projects</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
            <div class="select-chevron">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>Select Sprint</label>
          <div class="select-wrapper">
            <select v-model="selectedSprintId" class="filter-select" :disabled="!selectedProjectId">
              <option :value="null">All Sprints</option>
              <option v-for="sprint in filteredSprints" :key="sprint.id" :value="sprint.id">
                {{ sprint.name }}
              </option>
            </select>
            <div class="select-chevron">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>Start Date</label>
          <input type="date" v-model="startDate" class="filter-input" />
        </div>

        <div class="filter-group">
          <label>End Date</label>
          <input type="date" v-model="endDate" class="filter-input" />
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
  padding: 2.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-titles h1 {
  font-size: 1.85rem;
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
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
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

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  background: var(--color-bg-main);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 600;
  outline: none;
  transition: all 0.2s;
  appearance: none;
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-color-alpha);
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
