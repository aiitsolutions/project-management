import { hash } from '@node-rs/bcrypt'
import { db, generateId } from '../../utils/db'
import { createAccessToken, createRefreshToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { email, password, name } = body

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, password, and name are required'
    })
  }

  const existingUser = db.findByEmail('users', email)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User already exists'
    })
  }

  const hashedPassword = await hash(password)
  const now = new Date().toISOString()
  
  const user = db.create('users', {
    id: generateId('users'),
    email,
    password: hashedPassword,
    name,
    createdAt: now,
    updatedAt: now
  })

  const { password: _, ...userWithoutPassword } = user
  
  const accessToken = await createAccessToken({ userId: user.id, email: user.email })
  const refreshToken = await createRefreshToken({ userId: user.id, email: user.email })

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  }
})