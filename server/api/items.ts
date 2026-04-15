import { db, generateId } from '../utils/db'

const getProjectCounter = (projectId: number): number => {
  const projects = db.get('projects') as any[]
  const project = projects.find(p => p.id === projectId)
  return project?.lastItemNumber || 0
}

const incrementProjectCounter = (projectId: number): number => {
  const projects = db.get('projects') as any[]
  const index = projects.findIndex(p => p.id === projectId)
  if (index !== -1) {
    const newNumber = (projects[index].lastItemNumber || 0) + 1
    projects[index].lastItemNumber = newNumber
    db.set('projects', projects)
    return newNumber
  }
  return 1
}

const generateUid = (projectId: number): string => {
  const project = db.findById('projects', projectId) as any
  const prefix = project?.prefix || 'TASK'
  const nextNumber = incrementProjectCounter(projectId)
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id
  const projectIdQuery = getQuery(event).projectId

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    const projectId = projectIdQuery ? Number(projectIdQuery) : null
    
    let items = db.get('items') as any[]
    
    if (id) {
      const item = items.find(i => i.id === id)
      if (!item) throw createError({ statusCode: 404, statusMessage: 'Item not found' })
      return item
    }
    
    if (projectId) {
      items = items.filter(i => i.projectId === projectId)
    }
    
    return items
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.title || !body.projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Title and projectId are required' })
    }
    
    const newItem = {
      id: generateId('items'),
      uid: generateUid(body.projectId),
      projectId: body.projectId,
      parentId: body.parentId || null,
      title: body.title,
      description: body.description || '',
      type: body.type || 'Task',
      priority: body.priority || 'Medium',
      status: 'Backlog',
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      sprintId: body.sprintId || null,
      teamAllocations: body.teamAllocations || [],
      timeLogs: body.timeLogs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('items', newItem)
    return newItem
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Item ID is required' })
    
    const body = await readBody(event)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.status !== undefined) updateData.status = body.status
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.sprintId !== undefined) updateData.sprintId = body.sprintId
    if (body.parentId !== undefined) updateData.parentId = body.parentId
    if (body.teamAllocations !== undefined) updateData.teamAllocations = body.teamAllocations
    if (body.timeLogs !== undefined) updateData.timeLogs = body.timeLogs
    
    const updated = db.update('items', id, updateData)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Item not found' })
    
    return updated
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Item ID is required' })
    
    const deleted = db.delete('items', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Item not found' })
    return { success: true }
  }
})
