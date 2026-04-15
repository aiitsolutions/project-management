import { hash } from '@node-rs/bcrypt'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password } = body

  if (!token || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token and password are required'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters'
    })
  }

  // Find user with this reset token
  const users = db.get('users')
  const user = users.find(u => u.resetToken === token)
  
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reset token'
    })
  }

  // Check if token has expired
  if (user.resetExpiry && new Date(user.resetExpiry) < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Reset token has expired'
    })
  }

  // Hash new password and clear reset tokens
  const hashedPassword = await hash(password)
  
  db.update('users', user.id, {
    password: hashedPassword,
    resetToken: null,
    resetExpiry: null
  })

  return {
    success: true,
    message: 'Password reset successfully'
  }
})