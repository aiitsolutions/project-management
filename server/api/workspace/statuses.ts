import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const query = getQuery(event)

  // workspace_statuses collection handling
  if (method === 'GET') {
    let statuses = db.get('workspace_statuses') as any
    let settings = db.get('workspace_settings') as any
    
    // Initialize defaults if empty
    if (!statuses || Object.keys(statuses).length === 0) {
      statuses = {
        items: [
          { id: 'todo', name: 'To Do', color: '#64748B', isDefault: true },
          { id: 'in-progress', name: 'In Progress', color: '#3B82F6', isDefault: false },
          { id: 'done', name: 'Done', color: '#10B981', isDefault: false }
        ],
        sprints: [
          { id: 'Planned', name: 'Planned', color: '#94A3B8', isDefault: true },
          { id: 'In Progress', name: 'In Progress', color: '#10B981', isDefault: false },
          { id: 'Completed', name: 'Completed', color: '#111827', isDefault: false }
        ],
        projects: [
          { id: 'Active', name: 'Active', color: '#10B981', isDefault: true },
          { id: 'On Hold', name: 'On Hold', color: '#F59E0B', isDefault: false },
          { id: 'Completed', name: 'Completed', color: '#64748B', isDefault: false }
        ],
        releases: [
          { id: 'Planning', name: 'Planning', color: '#6366F1', isDefault: true },
          { id: 'In Progress', name: 'In Progress', color: '#F59E0B', isDefault: false },
          { id: 'Deployed', name: 'Deployed', color: '#10B981', isDefault: false }
        ]
      }
      db.set('workspace_statuses', statuses)
    }

    // Initialize itemTypes defaults — always merge so old DB records get any newly-added keys
    const defaultItemTypes: Record<string, any> = {
      Story: { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
      Task:  { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
      Bug:   { allowEstimatedPoints: false, canBeSubItem: true, allowUserAssignment: true }
    }
    settings = settings || {}
    if (settings.itemTypes) {
      // Merge: defaults first, then saved values on top — so existing toggles are preserved
      // but any missing keys (e.g. allowUserAssignment added later) are filled in
      for (const type of Object.keys(defaultItemTypes)) {
        settings.itemTypes[type] = { ...defaultItemTypes[type], ...settings.itemTypes[type] }
      }
    } else {
      settings.itemTypes = defaultItemTypes
    }
    db.set('workspace_settings', settings)
    
    // Return statuses and itemTypes
    return {
      ...statuses,
      itemTypes: settings.itemTypes
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { category, statuses } = body
    
    if (!category || !statuses) {
      throw createError({ statusCode: 400, statusMessage: 'Category and statuses are required' })
    }

    const allStatuses = (db.get('workspace_statuses') || {}) as any
    allStatuses[category] = statuses
    db.set('workspace_statuses', allStatuses)
    return { success: true }
  }
})
