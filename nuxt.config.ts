// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: false,
    head: {
      title: 'Project Management',
      titleTemplate: (title?: string) => {
        const app = 'Project Management'
        return title && title.length ? `${title} - ${app}` : app
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap'
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.ico'
        }
      ],
      meta: [
        {
          name: 'theme-color',
          content: '#10B981'
        }
      ]
    }
  }
})
