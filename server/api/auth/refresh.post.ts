import { db } from '../../utils/db'
import { verifyToken, createAccessToken, createRefreshToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')
  
  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No refresh token provided'
    })
  }

  const payload = await verifyToken(refreshToken)
  if (!payload || payload.type !== 'refresh') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token'
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
  
  const newAccessToken = await createAccessToken({ userId: user.id, email: user.email })
  const newRefreshToken = await createRefreshToken({ userId: user.id, email: user.email })

  setCookie(event, 'refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  return {
    user: userWithoutPassword,
    accessToken: newAccessToken
  }
})