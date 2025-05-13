import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: false // This will fail if port 5176 is not available instead of trying another port
  }
})
