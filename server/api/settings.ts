import { db } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const settings = db.getOne('settings')
    if (!settings) {
      return {
        name: "Antigravity",
        logo: "",
        darkLogo: "",
        favicon: "/favicon.ico",
        darkFavicon: "",
        colorScheme: "#10B981",
        footerText: "© 2026 Antigravity Project Management. All rights reserved.",
        language: "en",
        timezone: "UTC",
        fontFamily: "'Inter', system-ui, sans-serif",
        publicRegistration: true,
        maintenanceMode: false
      }
    }
    if (settings.publicRegistration === undefined) {
      settings.publicRegistration = true
    }
    if (settings.allowRegistration !== undefined) {
      settings.publicRegistration = settings.allowRegistration
      delete settings.allowRegistration
      db.saveOne('settings', settings)
    }
    return settings
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    if (body.allowRegistration !== undefined) {
      body.publicRegistration = body.allowRegistration
      delete body.allowRegistration
    }
    db.saveOne('settings', body)
    return { success: true, settings: body }
  }
})
