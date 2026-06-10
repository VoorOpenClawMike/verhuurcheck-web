import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Verhuurcheck',
        short_name: 'Verhuurcheck',
        description:
          'Bereken de maximale huurprijs van uw woning conform de Wet Betaalbare Huur 2025.',
        lang: 'nl',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1a73e8',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // HTML bewust niet precachen: navigaties lopen via NetworkFirst zodat
        // gebruikers na een deploy direct de nieuwe HTML zien
        globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-navigaties',
              networkTimeoutSeconds: 3,
            },
          },
          {
            // De WWS-berekening zelf is een POST (niet runtime-cachebaar);
            // deze regel dekt GET-endpoints van de verhuurcheck-API, zoals een
            // toekomstige puntentabel-fetch
            urlPattern: /^https:\/\/api\.floorplangen\.jarvisops\.online\/verhuurcheck\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wws-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
