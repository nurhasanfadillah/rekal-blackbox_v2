import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  server: {
    port: 3000,
    host: true
  }
})

# Automated fix for issue #1: [UI/UX Audit] Prioritas P0/P1: demo auth bypass, accessibility, dan kejelasan KPI
