import { verify } from '@node-rs/bcrypt'
import { db } from '../../utils/db'
import { createAccessToken, createRefreshToken } from '../../utils/jwt'
import { verifySync } from 'otplib'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { email, password, twoFactorCode, rememberDevice } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }

  const user = db.findByEmail('users', email)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const isValidPassword = await verify(password, user.password)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  if (user.is_active === false) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account has been deactivated. Please contact your Workspace Administrator.'
    })
  }

  if (user.two_factor_enabled) {
    const trustedCookie = getCookie(event, 'device_trusted')
    if (trustedCookie !== user.id.toString()) {
      if (!twoFactorCode) {
        return { 
          requires2FA: true,
          method: user.two_factor_method || 'authenticator'
        }
      }
      
      let isValid = false
      if (user.two_factor_method === 'email') {
        if (!user.email_2fa_code || !user.email_2fa_expires) {
          throw createError({ statusCode: 400, statusMessage: 'No verification code found. Please request a new code.' })
        }
        if (new Date(user.email_2fa_expires) < new Date()) {
          throw createError({ statusCode: 400, statusMessage: 'Verification code has expired. Please request a new one.' })
        }
        if (user.email_2fa_code !== twoFactorCode) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid verification code' })
        }
        isValid = true
      } else {
        const result2FA = verifySync({ token: twoFactorCode, secret: user.two_factor_secret })
        isValid = result2FA.valid
      }
      
      if (!isValid) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid 2FA code' })
      }
      
      if (rememberDevice) {
        setCookie(event, 'device_trusted', user.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30
        })
      }
    }
  }

  const { password: _, two_factor_secret, ...userWithoutPassword } = user
  
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