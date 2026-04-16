import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  // GET - fetch all workspace settings
  if (method === 'GET') {
    const query = getQuery(event)
    let settings = db.get('workspace_settings') as any
    
    // Return specific setting if requested
    if (query.type) {
      return settings?.[query.type] || { includeWeekends: false }
    }
    
    // Initialize defaults if empty
    if (!settings || Object.keys(settings).length === 0) {
      settings = {
        statuses: {
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
        },
        itemTypes: {
          Story: { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
          Task: { allowEstimatedPoints: true, canBeSubItem: true, allowUserAssignment: true },
          Bug: { allowEstimatedPoints: false, canBeSubItem: true, allowUserAssignment: true }
        }
      }
      db.set('workspace_settings', settings)
    }
    
    return settings
  }

  // POST - update workspace settings
  if (method === 'POST') {
    const body = await readBody(event)
    const { type, data } = body
    
    if (!type) {
      throw createError({ statusCode: 400, statusMessage: 'Settings type is required' })
    }

    const currentSettings = (db.get('workspace_settings') || {}) as any
    
    if (type === 'statuses') {
      currentSettings.statuses = data
    } else if (type === 'itemTypes') {
      currentSettings.itemTypes = data
    } else if (type === 'sprintSettings') {
      currentSettings.sprintSettings = data
    }
    
    db.set('workspace_settings', currentSettings)
    return { success: true }
  }
})