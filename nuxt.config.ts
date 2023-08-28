// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { typeCheck: true, strict: true },

  css: ['~/assets/styles/layout.scss', '~/assets/styles/misc.scss', '~/assets/styles/components.scss'],

  app: {
    head: {
      title: 'CrunchPNG',
      meta: [
        { name: 'description', content: 'Bulk .png optimizer' },
        { name: 'keywords', content: '.png, optimize, small, lossless, optimise' },
        { name: 'author', content: 'F53' },
        { name: 'theme-color', content: '#004b4b' },
        // twitter stuff
        { property: 'og:title', content: 'CrunchPNG' },
        { property: 'og:description', content: 'Bulk .png optimizer' },
        // { property: 'og:image', content: '' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@CodeF53' },
        { name: 'twitter:creator', content: '@CodeF53' },
      ],
    },
  },
})
