import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface User {
  id: number
  email: string
  password: string
  name: string
  createdAt: string
  updatedAt: string
  resetToken?: string | null
  resetExpiry?: string | null
}

// Use environment variable for persistent storage path
// On Hostinger, set this to a path outside the deployed code
const getPersistentPath = () => {
  const customPath = process.env.DATA_PATH
  
  if (customPath) {
    console.log('[DB] Using custom data path:', customPath)
    return customPath
  }
  
  // Fallback: use project-data folder at parent level
  const serverPath = process.cwd()
  const parentDir = join(serverPath, '..', 'project-data')
  const dataDir = join(parentDir, 'database')
  
  console.log('[DB] Using fallback data path:', dataDir)
  return dataDir
}

const DB_PATH = getPersistentPath()

const ensureDbDir = () => {
  if (!existsSync(DB_PATH)) {
    mkdirSync(DB_PATH, { recursive: true })
  }
}

const getDbFile = (table: string) => join(DB_PATH, `${table}.json`)

export const db = {
  // Support single-object tables (like settings)
  getOne<T = any>(table: string): T | null {
    ensureDbDir()
    const file = getDbFile(table)
    if (!existsSync(file)) return null
    try {
      return JSON.parse(readFileSync(file, 'utf-8'))
    } catch {
      return null
    }
  },

  saveOne<T = any>(table: string, data: T): void {
    ensureDbDir()
    const file = getDbFile(table)
    writeFileSync(file, JSON.stringify(data, null, 2))
  },

  get<T = any>(table: string): T[] {
    ensureDbDir()
    const file = getDbFile(table)
    if (!existsSync(file)) {
      return []
    }
    try {
      return JSON.parse(readFileSync(file, 'utf-8'))
    } catch {
      return []
    }
  },

  set<T = any>(table: string, data: T[]): void {
    ensureDbDir()
    const file = getDbFile(table)
    writeFileSync(file, JSON.stringify(data, null, 2))
  },

  findByEmail<T extends { email: string }>(table: string, email: string): T | undefined {
    const records = this.get<T>(table)
    return records.find(r => r.email === email)
  },

  findById<T extends { id: number }>(table: string, id: number): T | undefined {
    const records = this.get<T>(table)
    return records.find(r => r.id === id)
  },

  create<T>(table: string, record: T): T {
    const records = this.get<T>(table)
    records.push(record)
    this.set(table, records)
    return record
  },

  update<T extends { id: number }>(table: string, id: number, data: Partial<T>): T | undefined {
    const records = this.get<T>(table)
    const index = records.findIndex(r => r.id === id)
    if (index === -1) return undefined
    records[index] = { ...records[index], ...data }
    this.set(table, records)
    return records[index]
  },

  delete<T extends { id: number }>(table: string, id: number): boolean {
    const records = this.get<T>(table)
    const index = records.findIndex(r => r.id === id)
    if (index === -1) return false
    records.splice(index, 1)
    this.set(table, records)
    return true
  }
}

export const generateId = (table: string): number => {
  const records = db.get<{id: number}>(table)
  if (records.length === 0) return 1
  return Math.max(...records.map(r => r.id)) + 1
}