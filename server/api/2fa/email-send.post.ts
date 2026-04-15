import { db } from '../../utils/db'
import { verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const user = db.findById('users', payload.userId)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!user.two_factor_enabled || user.two_factor_method !== 'email') {
    throw createError({ statusCode: 400, statusMessage: 'Email 2FA is not enabled' })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  db.update('users', payload.userId, {
    email_2fa_code: code,
    email_2fa_expires: expiresAt
  })

  console.log(`Email 2FA code for ${user.email}: ${code}`)

  return { 
    success: true, 
    message: `Verification code sent to ${user.email}` 
  }
})