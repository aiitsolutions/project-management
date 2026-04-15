import { db, generateId } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    if (id) {
      const projects = db.get('projects') as any[]
      const project = projects.find(p => p.id === id)
      if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
      return project
    }
    // Return all projects
    const projects = db.get('projects')
    return projects
  }

  if (method === 'POST') {
    // Create new project
    const body = await readBody(event)
    const newProject = {
      ...body,
      id: generateId('projects'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('projects', newProject)
    return newProject
  }

  if (method === 'PUT') {
    // Update project
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })
    const body = await readBody(event)
    const updated = db.update('projects', id, { ...body, updatedAt: new Date().toISOString() })
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    return updated
  }

  if (method === 'DELETE') {
    // Delete project
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })
    const deleted = db.delete('projects', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    return { success: true }
  }
})
