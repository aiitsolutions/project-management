<template>
  <div class="settings-workspace">
    <!-- When navigating to /workspace/settings/roles/:id render the child page -->
    <NuxtPage v-if="route.params.id" />

    <!-- Roles table index (only when no :id in route) -->
    <template v-else>
      <div class="dashboard-header-row">
        <div class="dashboard-titles">
          <h1>Roles & Permissions</h1>
          <p>Manage user roles and access control for your workspace.</p>
        </div>
        <div class="header-actions-right">
          <button class="btn-primary" @click="openCreateModal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M8 3V13M3 8H13"/>
            </svg>
            Add Role
          </button>
        </div>
      </div>

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>
                <div class="user-cell">
                  <div class="role-badge" :style="{ background: role.color }">
                    {{ role.name.charAt(0) }}
                  </div>
                  <span class="user-name-cell">{{ role.name }}</span>
                </div>
              </td>
              <td>{{ role.description }}</td>
              <td class="members-cell">{{ role.members }}</td>
              <td class="type-cell">
                <span v-if="role.isDefault" class="status-badge status-active">Default</span>
                <span v-else class="status-badge status-inactive">Custom</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-view" @click="handleDuplicateRole(role)" title="Duplicate">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                  <button class="btn-edit" @click="openCreateModal(role)" title="Edit Name/Description">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-permissions" @click="editRole(role)" title="Edit Permissions">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </button>
                  <button class="btn-delete" @click="handleDeleteRole(role.id)" :disabled="role.isDefault" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingRole ? 'Edit Role' : 'Create New Role' }}</h3>
            <button class="modal-close-btn" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>Role Name</label>
              <input v-model="form.name" type="text" placeholder="e.g., Project Manager" class="base-input" />
            </div>
            <div class="input-group">
              <label>Description</label>
              <textarea v-model="form.description" placeholder="Describe the responsibilities of this role" class="base-textarea"></textarea>
            </div>
            <div class="input-group">
              <label>Role Color</label>
              <div class="color-picker-row">
                <button v-for="c in colors" :key="c" class="color-btn" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c" :title="c"></button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Cancel</button>
            <button class="btn-save" @click="saveRole">{{ editingRole ? 'Update Role' : 'Create Role' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRoles } from '~/composables/useRoles'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { roles, createRole, deleteRole, duplicateRole, updateRole } = useRoles()

// Page title
useHead({ title: 'Roles & Permissions' })

const selectedRole = ref(roles.value[0])
const showModal = ref(false)
const editingRole = ref<any>(null)
const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']
const form = ref({ name: '', description: '', color: '#3B82F6' })

const openCreateModal = (role?: any) => { 
  if (role) {
    editingRole.value = role
    form.value = { name: role.name, description: role.description, color: role.color }
  } else {
    editingRole.value = null
    form.value = { name: '', description: '', color: '#3B82F6' }
  }
  showModal.value = true
}
const editRole = (role: any) => { navigateTo(`/workspace/settings/roles/${role.id}`) }
const closeModal = () => { showModal.value = false; editingRole.value = null }

const saveRole = () => { 
  if (!form.value.name) return
  if (editingRole.value) {
    updateRole(editingRole.value.id, form.value)
  } else {
    createRole(form.value)
  }
  showModal.value = false 
}

const handleDeleteRole = (id: number) => { 
  if (confirm('Delete this role? This action cannot be undone.')) { 
    deleteRole(id)
    if (selectedRole.value?.id === id) selectedRole.value = roles.value[0] 
  } 
}

const handleDuplicateRole = (role: any) => { 
  duplicateRole(role.id)
}
</script>

<style scoped>
.settings-workspace { flex: 1; display: flex; flex-direction: column; }
.dashboard-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.dashboard-titles h1 { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.5rem 0; }
.dashboard-titles p { color: var(--color-text-muted); font-size: 0.95rem; margin: 0; }

.header-actions-right { display: flex; align-items: center; gap: 1rem; }
.btn-primary { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.users-table-container { background: var(--color-bg-card); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid var(--color-border); }
.empty-state { text-align: center; padding: 4rem; color: var(--color-text-muted); font-size: 0.95rem; }

.users-table { width: 100%; border-collapse: collapse; }
.users-table th { text-align: left; padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg-subtle); border-bottom: 1px solid var(--color-border); }
.users-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border-light); font-size: 0.9rem; color: var(--color-text-secondary); }
.users-table tr:hover { background: var(--color-bg-main); }

.user-cell { display: flex; align-items: center; gap: 1rem; }
.role-badge { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; flex-shrink: 0; }
.user-name-cell { font-weight: 600; color: var(--color-text-primary); }

.members-cell { text-align: center; font-weight: 600; }
.type-cell { text-align: center; }

.status-badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.status-active { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.status-inactive { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-edit, .btn-delete, .btn-status, .btn-view, .btn-permissions { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-view { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.btn-edit { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.btn-permissions { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
.btn-status { background: var(--color-bg-main); color: var(--color-text-muted); }
.btn-delete { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: var(--color-bg-card); width: 100%; max-width: 550px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid var(--color-border); }
.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.modal-close-btn { background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; padding: 0; }
.modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.input-group label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
.input-group input, .input-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.95rem; outline: none; background: var(--color-bg-main); color: var(--color-text-primary); }
.input-group input:focus, .input-group textarea:focus { border-color: var(--primary-color); }

.color-picker-row { display: flex; gap: 0.5rem; }
.color-btn { width: 32px; height: 32px; border-radius: 8px; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.color-btn:hover { transform: scale(1.1); }
.color-btn.active { border-color: var(--color-text-primary); }

.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-save { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: var(--color-bg-main); border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; color: var(--color-text-secondary); cursor: pointer; }
</style>
