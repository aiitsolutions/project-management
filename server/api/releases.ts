import { db, generateId } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id
  const projectIdQuery = getQuery(event).projectId

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    const projectId = projectIdQuery ? Number(projectIdQuery) : null
    let releases = db.get('releases') as any[]
    
    if (id) {
      const release = releases.find(r => r.id === id)
      if (!release) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      return release
    }
    
    if (projectId) {
      releases = releases.filter(r => r.projectId === projectId)
    }
    
    return releases
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.name || !body.projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Name and projectId are required' })
    }
    
    const newRelease = {
      id: generateId('releases'),
      projectId: body.projectId,
      name: body.name,
      description: body.description || '',
      status: body.status || 'Planning',
      sprintIds: body.sprintIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('releases', newRelease)
    return newRelease
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Release ID is required' })
    
    const body = await readBody(event)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.sprintIds !== undefined) updateData.sprintIds = body.sprintIds
    
    const updated = db.update('releases', id, updateData)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
    
    return updated
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Release ID is required' })
    
    const deleted = db.delete('releases', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
    return { success: true }
  }
})
