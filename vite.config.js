import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 개발 중 CORS 회피: /api → 실제 백엔드
      '/api': {
        target: 'https://dermalens-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/media': {
        target: 'https://dermalens-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
