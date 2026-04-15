import { db } from '../../utils/db'
import { verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided'
    })
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  
  if (!payload || payload.type !== 'access') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const user = db.findById('users', payload.userId)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found'
    })
  }

  const { password: _, ...userWithoutPassword } = user
  
  return { user: userWithoutPassword }
})