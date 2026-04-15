import { db, generateId } from '../utils/db'
import { hash, verify } from '@node-rs/bcrypt'

export default defineEventHandler(async (event) => {
  const method = event.method
  const idQuery = getQuery(event).id

  if (method === 'GET') {
    const id = idQuery ? Number(idQuery) : null
    if (id) {
      const users = db.get('users') as any[]
      const user = users.find(u => u.id === id)
      if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_photo: user.profile_photo || null,
        is_active: user.is_active !== undefined ? user.is_active : true,
        two_factor_enabled: user.two_factor_enabled || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
    const users = db.get('users')
    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      profile_photo: u.profile_photo || null,
      is_active: u.is_active !== undefined ? u.is_active : true,
      two_factor_enabled: u.two_factor_enabled || false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.email || !body.password || !body.name) {
      throw createError({ statusCode: 400, statusMessage: 'Name, email and password are required' })
    }
    
    const existingUser = db.findByEmail('users', body.email)
    if (existingUser) {
      throw createError({ statusCode: 400, statusMessage: 'User with this email already exists' })
    }
    
    const hashedPassword = await hash(body.password)
    
    const newUser = {
      id: generateId('users'),
      name: body.name,
      email: body.email,
      password: hashedPassword,
      profile_photo: body.profile_photo || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.create('users', newUser)
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profile_photo: newUser.profile_photo,
      is_active: newUser.is_active,
      two_factor_enabled: false,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }
  }

  if (method === 'PUT') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    
    const body = await readBody(event)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.email) {
      const existingUser = db.findByEmail('users', body.email)
      if (existingUser && existingUser.id !== id) {
        throw createError({ statusCode: 400, statusMessage: 'User with this email already exists' })
      }
      updateData.email = body.email
    }
    if (body.password) {
      // Allow password change without old password (admin capability)
      // Or verify old password if provided (user changing their own password)
      if (body.oldPassword) {
        const currentUser = db.findById('users', id)
        if (currentUser) {
          const isValid = await verify(body.oldPassword, currentUser.password)
          if (!isValid) throw createError({ statusCode: 400, statusMessage: 'Incorrect current password' })
        }
      }
      updateData.password = await hash(body.password)
    }
    if (body.profile_photo !== undefined) updateData.profile_photo = body.profile_photo
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    
    const updated = db.update('users', id, updateData)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      profile_photo: updated.profile_photo || null,
      is_active: updated.is_active !== undefined ? updated.is_active : true,
      two_factor_enabled: updated.two_factor_enabled || false,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }
  }

  if (method === 'DELETE') {
    const id = Number(idQuery)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    
    const currentUser = db.findById('users', id)
    if (!currentUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    
    const deleted = db.delete('users', id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    return { success: true }
  }
})
