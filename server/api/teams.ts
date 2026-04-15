import { db, generateId } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    let teams = db.get('teams') as any[]
    
    if (id) {
       const team = teams.find(t => t.id === id)
       if (!team) throw createError({ statusCode: 404, statusMessage: 'Team not found' })
       return team
    }
    
    return teams
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.name) {
      throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }
    
    const newTeam = {
      id: generateId('teams'),
      name: body.name,
      description: body.description || '',
      memberIds: body.memberIds || [],
      color: body.color || '#10B981',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('teams', newTeam)
    return newTeam
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
    
    const body = await readBody(event)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.memberIds !== undefined) updateData.memberIds = body.memberIds
    if (body.color !== undefined) updateData.color = body.color
    
    const updated = db.update('teams', id, updateData)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Team not found' })
    
    return updated
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
    
    const deleted = db.delete('teams', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Team not found' })
    return { success: true }
  }
})
