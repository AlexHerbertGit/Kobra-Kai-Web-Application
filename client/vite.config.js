import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
      manifest: {
        name: 'Kobra Kai Charity',
        short_name: 'KobraKai',
        description:
          'Support the Kobra Kai Charity community initiatives with this progressive web experience.',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/kobra-kai-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/kobra-kai-logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      
    }),
  ],
})
