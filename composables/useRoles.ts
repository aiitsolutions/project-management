import { ref } from 'vue'

const roles = ref([
  { id: 1, name: 'Admin', description: 'Full system access', color: '#EF4444', isDefault: true, members: 2,
    permissions: { projects: { view: true, create: true, edit: true, delete: true }, items: { view: true, create: true, edit: true, delete: true, assign: true }, sprints: { view: true, create: true, edit: true, delete: true }, epics: { view: true, create: true, edit: true, delete: true }, releases: { view: true, create: true, edit: true, delete: true }, teams: { view: true, create: true, edit: true, delete: true, manage: true }, timesheets: { view: true, create: true, edit: true, delete: true }, backlog: { view: true, create: true, edit: true, delete: true }, settings: { view: true, edit: true, 'manage-users': true, 'manage-roles': true }, dashboard: { 'view-dashboard': true, 'view-reports': true, 'export-data': true } }
  },
  { id: 2, name: 'Manager', description: 'Manage projects', color: '#F59E0B', isDefault: false, members: 3,
    permissions: { projects: { view: true, create: true, edit: true, delete: false }, items: { view: true, create: true, edit: true, delete: true, assign: true }, sprints: { view: true, create: true, edit: true, delete: true }, epics: { view: true, create: true, edit: true, delete: true }, releases: { view: true, create: true, edit: true, delete: true }, teams: { view: true, create: true, edit: true, delete: false, manage: true }, timesheets: { view: true, create: true, edit: true, delete: false }, backlog: { view: true, create: true, edit: true, delete: true }, settings: { view: false, edit: false, 'manage-users': false, 'manage-roles': false }, dashboard: { 'view-dashboard': true, 'view-reports': true, 'export-data': false } }
  },
  { id: 3, name: 'Developer', description: 'Build tasks', color: '#10B981', isDefault: false, members: 8,
    permissions: { projects: { view: true, create: false, edit: false, delete: false }, items: { view: true, create: true, edit: true, delete: false, assign: false }, sprints: { view: true, create: false, edit: false, delete: false }, epics: { view: true, create: false, edit: false, delete: false }, releases: { view: true, create: false, edit: false, delete: false }, teams: { view: true, create: false, edit: false, delete: false, manage: false }, timesheets: { view: true, create: true, edit: true, delete: false }, backlog: { view: true, create: true, edit: false, delete: false }, settings: { view: false, edit: false, 'manage-users': false, 'manage-roles': false }, dashboard: { 'view-dashboard': true, 'view-reports': false, 'export-data': false } }
  },
  { id: 4, name: 'Viewer', description: 'View only', color: '#6B7280', isDefault: false, members: 5,
    permissions: { projects: { view: true, create: false, edit: false, delete: false }, items: { view: true, create: false, edit: false, delete: false, assign: false }, sprints: { view: true, create: false, edit: false, delete: false }, epics: { view: true, create: false, edit: false, delete: false }, releases: { view: true, create: false, edit: false, delete: false }, teams: { view: true, create: false, edit: false, delete: false, manage: false }, timesheets: { view: true, create: false, edit: false, delete: false }, backlog: { view: true, create: false, edit: false, delete: false }, settings: { view: false, edit: false, 'manage-users': false, 'manage-roles': false }, dashboard: { 'view-dashboard': true, 'view-reports': false, 'export-data': false } }
  }
])

export const useRoles = () => {
  const getRoleById = (id: number) => {
    return roles.value.find(r => r.id === id)
  }

  const updateRole = (id: number, updates: any) => {
    const role = getRoleById(id)
    if (role) {
      Object.assign(role, updates)
    }
  }

  const createRole = (roleData: any) => {
    const newRole = {
      id: Date.now(),
      ...roleData,
      isDefault: false,
      members: 0,
      permissions: {
        projects: { view: true, create: false, edit: false, delete: false },
        items: { view: true, create: false, edit: false, delete: false, assign: false },
        sprints: { view: true, create: false, edit: false, delete: false },
        epics: { view: true, create: false, edit: false, delete: false },
        releases: { view: true, create: false, edit: false, delete: false },
        teams: { view: true, create: false, edit: false, delete: false, manage: false },
        timesheets: { view: true, create: false, edit: false, delete: false },
        backlog: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, edit: false, 'manage-users': false, 'manage-roles': false },
        dashboard: { 'view-dashboard': false, 'view-reports': false, 'export-data': false }
      }
    }
    roles.value.push(newRole)
    return newRole
  }

  const deleteRole = (id: number) => {
    roles.value = roles.value.filter(r => r.id !== id)
  }

  const duplicateRole = (id: number) => {
    const sourceRole = getRoleById(id)
    if (!sourceRole) return null

    const newRole = {
      ...sourceRole,
      id: Date.now(),
      name: sourceRole.name + ' (Copy)',
      isDefault: false,
      members: 0,
      permissions: JSON.parse(JSON.stringify(sourceRole.permissions))
    }
    roles.value.push(newRole)
    return newRole
  }

  return {
    roles,
    getRoleById,
    updateRole,
    createRole,
    deleteRole,
    duplicateRole
  }
}
