<template>
  <div class="permissions-page" :key="componentKey">
    <header class="page-header">
      <div class="header-content">
        <button class="btn-back" @click="navigateTo('/workspace/settings/roles')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
         <div class="header-titles">
           <h1>Edit Role Permissions</h1>
           <p>Manage access control for <strong>{{ role?.name || 'Loading...' }}</strong> (ID: {{ route.params.id }})</p>
         </div>
      </div>
      <button class="btn-save-header" @click="savePermissions" :disabled="saving">
        <svg v-if="saving" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        </svg>
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </header>

    <main class="permissions-content">
      <!-- Projects Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon projects-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2m0 0h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3m-6-4l2.5-3.5L17 12"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Projects</h2>
            <p class="module-description">Control access to project management features</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('projects', !hasAllPermissions('projects'))">
            {{ hasAllPermissions('projects') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.projects[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Items/Tasks Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon items-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Items & Tasks</h2>
            <p class="module-description">Manage work items, tasks, and issue tracking</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('items', !hasAllPermissions('items'))">
            {{ hasAllPermissions('items') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete', 'assign']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.items[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Sprints Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon sprints-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle><path d="M12 8v-2m4 10h2m-10 0h-2m4 4v2"></path>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Sprints</h2>
            <p class="module-description">Sprint planning and management</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('sprints', !hasAllPermissions('sprints'))">
            {{ hasAllPermissions('sprints') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.sprints[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Epics Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon epics-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Epics</h2>
            <p class="module-description">Epic and story management</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('epics', !hasAllPermissions('epics'))">
            {{ hasAllPermissions('epics') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.epics[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Releases Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon releases-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9h6"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Releases</h2>
            <p class="module-description">Release planning and tracking</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('releases', !hasAllPermissions('releases'))">
            {{ hasAllPermissions('releases') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.releases[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Teams Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon teams-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Teams</h2>
            <p class="module-description">Team management and member control</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('teams', !hasAllPermissions('teams'))">
            {{ hasAllPermissions('teams') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete', 'manage']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.teams[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Timesheets Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon timesheets-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Timesheets</h2>
            <p class="module-description">Time tracking and logging</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('timesheets', !hasAllPermissions('timesheets'))">
            {{ hasAllPermissions('timesheets') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.timesheets[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Backlog Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon backlog-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Backlog</h2>
            <p class="module-description">Product backlog management</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('backlog', !hasAllPermissions('backlog'))">
            {{ hasAllPermissions('backlog') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'create', 'edit', 'delete']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.backlog[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Settings Module -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon settings-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m3.08-3.08l4.24-4.24"></path>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Settings & Administration</h2>
            <p class="module-description">System configuration and administration</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('settings', !hasAllPermissions('settings'))">
            {{ hasAllPermissions('settings') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view', 'edit', 'manage-users', 'manage-roles']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.settings[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>

      <!-- Dashboard & Analytics -->
      <section class="permission-module">
        <div class="module-header">
          <div class="module-icon dashboard-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <div class="module-info">
            <h2 class="module-title">Dashboard & Analytics</h2>
            <p class="module-description">Access to dashboards and reporting</p>
          </div>
          <button class="btn-toggle-all" @click="toggleModuleAll('dashboard', !hasAllPermissions('dashboard'))">
            {{ hasAllPermissions('dashboard') ? 'Unselect All' : 'Select All' }}
          </button>
        </div>
        <div class="permissions-grid">
          <label v-for="perm in ['view-dashboard', 'view-reports', 'export-data']" :key="perm" class="permission-item">
            <input type="checkbox" v-model="permissions.dashboard[perm]" />
            <span class="checkbox-custom"></span>
            <span class="permission-label">{{ capitalizeFirst(perm) }}</span>
          </label>
        </div>
      </section>
    </main>

    <footer class="page-footer">
      <button class="btn-cancel" @click="navigateTo('/workspace/settings/roles')">Cancel</button>
      <button class="btn-save-footer" @click="savePermissions" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Permissions' }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRoles } from '~/composables/useRoles'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { getRoleById, updateRole } = useRoles()
const saving = ref(false)
const componentKey = ref(0)

// Reactive role and permissions
const role = ref<any>(null)

// Dynamic page title: Edit Role: <name>
const pageTitle = computed(() => role.value?.name ? `Edit Role: ${role.value.name}` : 'Edit Role')
useHead({ title: pageTitle })

const permissions = reactive({
  projects: { view: true, create: true, edit: true, delete: false },
  items: { view: true, create: true, edit: true, delete: false, assign: true },
  sprints: { view: true, create: false, edit: false, delete: false },
  epics: { view: true, create: false, edit: false, delete: false },
  releases: { view: true, create: false, edit: false, delete: false },
  teams: { view: true, create: false, edit: false, delete: false, manage: false },
  timesheets: { view: true, create: true, edit: false, delete: false },
  backlog: { view: true, create: true, edit: true, delete: false },
  settings: { view: false, edit: false, 'manage-users': false, 'manage-roles': false },
  dashboard: { 'view-dashboard': true, 'view-reports': false, 'export-data': false }
})

const allModules = ['projects', 'items', 'sprints', 'epics', 'releases', 'teams', 'timesheets', 'backlog', 'settings', 'dashboard']

const currentRoleId = computed(() => parseInt(route.params.id as string, 10))

const loadRoleData = (roleId?: number) => {
  // Get role ID from route params or use provided ID
  const id = roleId || parseInt(route.params.id as string, 10)
  
  console.log('===== loadRoleData called =====')
  console.log('Loading role data for ID:', id)
  console.log('route.params.id:', route.params.id)
  
  // Find the role using the composable
  const foundRole = getRoleById(id)
  
  console.log('Found role:', foundRole)
  console.log('Found role name:', foundRole?.name)
  
  if (foundRole) {
    console.log('Setting role.value to:', foundRole.name)
    role.value = foundRole
    
    // Deep copy the permissions from the role
    if (foundRole.permissions) {
      const newPerms = JSON.parse(JSON.stringify(foundRole.permissions))
      console.log('New permissions object:', newPerms)
      
      // Replace entire nested objects to ensure reactivity
      permissions.projects = newPerms.projects || permissions.projects
      permissions.items = newPerms.items || permissions.items
      permissions.sprints = newPerms.sprints || permissions.sprints
      permissions.epics = newPerms.epics || permissions.epics
      permissions.releases = newPerms.releases || permissions.releases
      permissions.teams = newPerms.teams || permissions.teams
      permissions.timesheets = newPerms.timesheets || permissions.timesheets
      permissions.backlog = newPerms.backlog || permissions.backlog
      permissions.settings = newPerms.settings || permissions.settings
      permissions.dashboard = newPerms.dashboard || permissions.dashboard
      
      console.log('Permissions updated:', permissions)
    }
    
    // Increment key to force component visual update
    componentKey.value++
    console.log('Incremented componentKey to:', componentKey.value)
  } else {
    console.warn('❌ Role not found with ID:', id)
  }
  console.log('===== loadRoleData finished =====')
}

// Handle route updates when navigating between roles
watch(() => route.params.id, (newId) => {
  console.log('🔄 Watch triggered: route.params.id changed to', newId)
  if (newId) {
    const id = parseInt(newId as string, 10)
    loadRoleData(id)
  }
}, { immediate: true })

const hasAllPermissions = (module: string) => {
  const perms = permissions[module as keyof typeof permissions]
  return Object.values(perms).every(v => v === true)
}

const toggleModuleAll = (module: string, checked: boolean) => {
  const perms = permissions[module as keyof typeof permissions]
  Object.keys(perms).forEach(key => {
    perms[key] = checked
  })
}

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ')
}

const savePermissions = async () => {
  saving.value = true
  try {
    // Here you would make an API call to save permissions
    // await $fetch(`/api/roles/${route.params.id}`, {
    //   method: 'PUT',
    //   body: { permissions }
    // })
    console.log('Saving permissions for role:', role.value?.name, permissions)
    
    // Update the role's permissions in the composable
    if (role.value) {
      updateRole(role.value.id, { permissions: JSON.parse(JSON.stringify(permissions)) })
    }
    
    // Navigate back after save
    setTimeout(async () => {
      saving.value = false
      await navigateTo('/workspace/settings/roles')
    }, 800)
  } catch (error) {
    console.error('Error saving permissions:', error)
    saving.value = false
  }
}
</script>

<style scoped>
.permissions-page {
  min-height: 100vh;
  background: var(--color-bg-main);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.btn-back {
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.header-titles h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.header-titles p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.header-titles p strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

.btn-save-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save-header:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.btn-save-header:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.permissions-content {
  flex: 1;
  padding: 2.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.permission-module {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.2s;
}

.permission-module:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.module-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-weight: 700;
}

.projects-icon { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); }
.items-icon { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
.sprints-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
.epics-icon { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
.releases-icon { background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); }
.teams-icon { background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); }
.timesheets-icon { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
.backlog-icon { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
.settings-icon { background: linear-gradient(135deg, #64748B 0%, #475569 100%); }
.dashboard-icon { background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); }

.module-info {
  flex: 1;
}

.module-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
}

.module-description {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
}

.btn-toggle-all {
  padding: 0.5rem 1rem;
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.btn-toggle-all:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  background: var(--color-bg-main);
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.permission-item:hover {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}

.permission-item input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.permission-item input:checked ~ .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.permission-item input:checked ~ .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}

.permission-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.page-footer {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.btn-save-footer {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-footer:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-save-footer:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .permissions-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .permissions-content {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .permission-module {
    padding: 1.5rem;
  }

  .module-header {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-toggle-all {
    width: 100%;
  }

  .page-footer {
    flex-direction: column-reverse;
    padding: 1rem 1.5rem;
  }

  .btn-cancel, .btn-save-footer {
    width: 100%;
  }
}
</style>
