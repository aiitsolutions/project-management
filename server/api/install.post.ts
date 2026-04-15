import { defineEventHandler, readBody } from 'h3'
import { db, generateId } from '../utils/db'
import bcrypt from '@node-rs/bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { adminName, adminEmail, adminPassword, workspaceName, colorScheme } = body

  if (!adminName || !adminEmail || !adminPassword || !workspaceName) {
    throw createError({
      statusCode: 400,
      message: 'All fields are required'
    })
  }

  const existingConfig = db.getOne('config')
  if (existingConfig?.installed) {
    throw createError({
      statusCode: 400,
      message: 'Application is already installed'
    })
  }

  const adminId = generateId('users')
  const now = new Date().toISOString()
  
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const adminUser = {
    id: adminId,
    name: adminName,
    email: adminEmail,
    password: passwordHash,
    is_active: true,
    created_at: now,
    updated_at: now
  }

  db.create('users', adminUser)

  const workspaceSettingsId = generateId('workspace_settings')
  const workspaceSettings = {
    id: workspaceSettingsId,
    colorScheme: colorScheme || '#10B981',
    statuses: [
      { id: 1, name: 'Backlog', category: 'backlog' },
      { id: 2, name: 'To Do', category: 'todo' },
      { id: 3, name: 'In Progress', category: 'inprogress' },
      { id: 4, name: 'Done', category: 'done' }
    ]
  }
  db.saveOne('workspace_settings', workspaceSettings)

  db.saveOne('config', {
    installed: true,
    installedAt: now,
    workspaceName: workspaceName
  })

  return { success: true }
})