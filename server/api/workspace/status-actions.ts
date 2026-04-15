import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const body = await readBody(event)

  const categoryMap: any = {
    items: 'items',
    sprints: 'sprints',
    projects: 'projects',
    releases: 'releases'
  }

  if (method === 'POST') {
     const { action, category, statusId, targetStatusId } = body
     
     if (action === 'check-usage') {
        const collection = categoryMap[category]
        if (!collection) return { count: 0 }
        
        const allData = db.get(collection) as any[]
        // Field names might differ. Items/Sprints/Projects/Releases usually have 'status'
        const count = allData.filter(item => item.status === statusId).length
        return { count }
     }

     if (action === 'migrate-and-delete') {
        const collection = categoryMap[category]
        if (!collection) throw createError({ statusCode: 400, statusMessage: 'Invalid category' })
        
        // 1. Migrate items
        const allData = db.get(collection) as any[]
        const updatedData = allData.map(item => {
           if (item.status === statusId) {
              return { ...item, status: targetStatusId, updatedAt: new Date().toISOString() }
           }
           return item
        })
        db.set(collection, updatedData)

        // 2. Delete status from settings
        const allStatuses = (db.get('workspace_statuses') || {}) as any
        if (allStatuses[category]) {
           allStatuses[category] = allStatuses[category].filter((s: any) => s.id !== statusId)
           // Ensure at least one default remains if we deleted the default
           if (allStatuses[category].length > 0 && !allStatuses[category].find((s: any) => s.isDefault)) {
              allStatuses[category][0].isDefault = true
           }
           db.set('workspace_statuses', allStatuses)
        }
        
        return { success: true }
     }
  }
})
