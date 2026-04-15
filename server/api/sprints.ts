import { db, generateId } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id
  const projectIdQuery = getQuery(event).projectId

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    const projectId = projectIdQuery ? Number(projectIdQuery) : null
    let sprints = db.get('sprints') as any[]
    
    if (id) {
      const sprint = sprints.find(s => s.id === id)
      if (!sprint) throw createError({ statusCode: 404, statusMessage: 'Sprint not found' })
      return sprint
    }
    
    if (projectId) {
      sprints = sprints.filter(s => s.projectId === projectId)
    }
    
    return sprints
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.name || !body.projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Name and projectId are required' })
    }
    
    const newSprint = {
      id: generateId('sprints'),
      projectId: body.projectId,
      name: body.name,
      description: body.description || '',
      ownerId: body.ownerId || null,
      startDate: body.startDate,
      endDate: body.endDate,
      status: 'Not Started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('sprints', newSprint)
    return newSprint
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Sprint ID is required' })
    
    const body = await readBody(event)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.status !== undefined) updateData.status = body.status
    
    const updated = db.update('sprints', id, updateData)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Sprint not found' })
    
    return updated
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Sprint ID is required' })
    
    // Move all items in this sprint back to backlog
    const items = db.get('items') as any[]
    const updatedItems = items.map(item => {
      if (item.sprintId === id) {
        return { ...item, sprintId: null, status: 'Backlog', updatedAt: new Date().toISOString() }
      }
      return item
    })
    db.set('items', updatedItems)
    
    // Delete the sprint
    const deleted = db.delete('sprints', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Sprint not found' })
    return { success: true }
  }
})
