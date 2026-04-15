import { randomBytes } from 'crypto'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }

  const user = db.findByEmail('users', email)
  
  // Always return success to prevent email enumeration
  // In production, you would send the email here
  
  if (user) {
    const resetToken = randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 3600000).toISOString() // 1 hour
    
    db.update('users', user.id, {
      resetToken,
      resetExpiry
    })
  }

  return {
    success: true,
    message: 'If the email exists, a reset link has been sent'
  }
})