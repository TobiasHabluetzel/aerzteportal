import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Aerzteportal.Api/wwwroot',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
