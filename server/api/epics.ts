import { db, generateId } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const projectIdQuery = getQuery(event).projectId
  const idQuery = getQuery(event).id

  if (method === 'GET') {
    const projectId = projectIdQuery ? Number(projectIdQuery) : null
    const id = idQuery ? Number(idQuery) : null

    if (id) {
      const epics = db.get('epics') as any[]
      const epic = epics.find(e => e.id === id)
      if (!epic) throw createError({ statusCode: 404, statusMessage: 'Epic not found' })
      return epic
    }

    if (projectId) {
      const epics = db.get('epics') as any[]
      return epics.filter(e => e.projectId === projectId)
    }

    return db.get('epics')
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const newEpic = {
      ...body,
      id: generateId('epics'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('epics', newEpic)
    return newEpic
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Epic ID is required' })
    const body = await readBody(event)
    const updated = db.update('epics', id, { ...body, updatedAt: new Date().toISOString() })
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Epic not found' })
    return updated
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Epic ID is required' })
    const deleted = db.delete('epics', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Epic not found' })
    return { success: true }
  }
})
