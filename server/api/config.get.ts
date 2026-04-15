import { db } from '../utils/db'

export default defineEventHandler((event) => {
  const config = db.getOne('config')
  return {
    installed: config?.installed || false,
    workspaceName: config?.workspaceName || ''
  }
})