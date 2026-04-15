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

  const body = await readBody(event)
  const { code } = body

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Verification code is required' })
  }

  const user = db.findById('users', payload.userId)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!user.email_2fa_code || !user.email_2fa_expires) {
    throw createError({ statusCode: 400, statusMessage: 'No verification code found. Please request a new code.' })
  }

  if (new Date(user.email_2fa_expires) < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'Verification code has expired. Please request a new one.' })
  }

  if (user.email_2fa_code !== code) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid verification code' })
  }

  db.update('users', payload.userId, {
    two_factor_enabled: true,
    two_factor_method: 'email',
    email_2fa_code: null,
    email_2fa_expires: null
  })

  return { success: true }
})