import { db } from '../../utils/db'
import { verifyToken } from '../../utils/jwt'
import { verifySync } from 'otplib'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401 })
  }
  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401 })

  const body = await readBody(event)
  const { code } = body
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Authenticator code is required' })

  const user = db.findById('users', payload.userId)
  if (!user || !user.two_factor_enabled) {
    throw createError({ statusCode: 400, statusMessage: '2FA is not enabled' })
  }

  const result = verifySync({ token: code, secret: user.two_factor_secret })
  if (!result.valid) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid code' })
  }

  db.update('users', payload.userId, {
    two_factor_enabled: false,
    two_factor_secret: null
  })

  return { success: true }
})
