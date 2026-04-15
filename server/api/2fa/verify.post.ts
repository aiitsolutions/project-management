import { verifySync } from 'otplib'
import { db } from '../../utils/db'
import { verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401 })
  }
  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401 })

  const body = await readBody(event)
  const { code, secret } = body

  if (!code || !secret) {
    throw createError({ statusCode: 400, statusMessage: 'Code and secret required' })
  }

  const result = verifySync({ token: code, secret })

  if (!result.valid) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid code' })
  }

  db.update('users', payload.userId, {
    two_factor_enabled: true,
    two_factor_secret: secret
  })

  return { success: true }
})
