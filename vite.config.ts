import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Pa\'la Vaca',
          short_name: 'Pa\'la Vaca',
          description: 'Sistema integral de gestión ganadera',
          lang: 'es-MX',
          theme_color: '#24452F',
          background_color: '#F7F8F4',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          navigateFallback: '/index.html'
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallbackAllowlist: [
            /^\/(?!@vite\/|@id\/|@fs\/|src\/|node_modules\/).*/
          ]
        },
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
