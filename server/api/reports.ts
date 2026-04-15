import { db } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  
  if (method === 'GET') {
    const query = getQuery(event)
    const projectId = query.projectId ? Number(query.projectId) : null
    const sprintId = query.sprintId ? Number(query.sprintId) : null
    const startDate = query.startDate as string | null
    const endDate = query.endDate as string | null

    let items = db.get('items') as any[]

    if (projectId) {
      items = items.filter(i => i.projectId === projectId)
    }

    if (sprintId) {
      items = items.filter(i => i.sprintId === sprintId)
    }

    if (startDate) {
      items = items.filter(i => i.createdAt && new Date(i.createdAt) >= new Date(startDate))
    }

    if (endDate) {
      items = items.filter(i => i.createdAt && new Date(i.createdAt) <= new Date(endDate + 'T23:59:59'))
    }

    return items
  }
})
