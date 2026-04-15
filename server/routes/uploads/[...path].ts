import { existsSync, readFileSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  let filePath = event.path
  
  // Handle /uploads/ prefix
  if (filePath.startsWith('/uploads/')) {
    filePath = filePath.substring('/uploads/'.length)
  }
  
  if (!filePath || filePath.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' })
  }

  // Get the persistent uploads path from environment
  const customUploadsPath = process.env.UPLOADS_PATH
  
  let uploadDir: string
  if (customUploadsPath) {
    uploadDir = customUploadsPath
  } else {
    const serverPath = process.cwd()
    const parentDir = join(serverPath, '..', 'project-data')
    uploadDir = join(parentDir, 'uploads')
  }

  const sourcePath = join(uploadDir, filePath)
  
  // Check if file exists in persistent storage
  if (!existsSync(sourcePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const fileBuffer = readFileSync(sourcePath)
  
  const ext = filePath.split('.').pop()?.toLowerCase() || 'png'
  const contentTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp'
  }

  setHeader(event, 'Content-Type', contentTypes[ext] || 'application/octet-stream')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')
  
  return fileBuffer
})
