import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/WearUp', // Set the base path for the application
  server: {
    proxy: {
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
