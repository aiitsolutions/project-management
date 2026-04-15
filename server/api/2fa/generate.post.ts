import { generateSecret, generateURI } from 'otplib'
import QRCode from 'qrcode'
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

  const secret = generateSecret()
  const appName = "Antigravity App"
  const otpauth = generateURI({ secret, issuer: appName, label: user.email })

  let qrDataUrl = ""
  try {
    qrDataUrl = await QRCode.toDataURL(otpauth)
  } catch (err) {
    console.error(err)
  }

  return { secret, qrDataUrl }
})
