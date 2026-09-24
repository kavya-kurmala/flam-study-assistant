import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies /api requests to the local backend during `npm run dev`,
// so the frontend never needs to know the backend's port directly.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
