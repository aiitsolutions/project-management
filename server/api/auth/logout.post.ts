export default defineEventHandler(async (event) => {
  deleteCookie(event, 'refresh_token')
  
  return { success: true, message: 'Logged out successfully' }
})