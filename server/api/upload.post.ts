import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const file = formData.find(item => item.name === 'file')
    if (!file || !file.data) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file data' })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Extract extension safely
    const originalName = file.filename || 'upload.png'
    const match = originalName.match(/\.([^.]+)$/)
    const ext = match ? match[1] : 'png'
    
    // Generate unique name
    const uniqueName = `${randomUUID()}.${ext}`
    const filePath = join(uploadDir, uniqueName)

    writeFileSync(filePath, file.data)

    // Return the public URL for the file
    return {
      url: `/uploads/${uniqueName}`
    }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: 'Upload Failed', cause: err })
  }
})
