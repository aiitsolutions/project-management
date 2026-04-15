import { verify } from '@node-rs/bcrypt'
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

  const body = await readBody(event)
  const { enable, password, method } = body

  if (enable) {
    if (user.two_factor_enabled && user.two_factor_method === 'authenticator') {
      throw createError({ statusCode: 400, statusMessage: 'Authenticator 2FA is already enabled. Disable it first to switch to email 2FA.' })
    }

    db.update('users', payload.userId, {
      two_factor_enabled: true,
      two_factor_method: method || 'email'
    })
  } else {
    if (!user.two_factor_enabled) {
      throw createError({ statusCode: 400, statusMessage: '2FA is not enabled' })
    }

    if (user.two_factor_method === 'email') {
      if (!password) {
        throw createError({ statusCode: 400, statusMessage: 'Password is required to disable email 2FA' })
      }
      const isValid = await verify(password, user.password)
      if (!isValid) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid password' })
      }
    }

    db.update('users', payload.userId, {
      two_factor_enabled: false,
      two_factor_method: null
    })
  }

  return { success: true }
})