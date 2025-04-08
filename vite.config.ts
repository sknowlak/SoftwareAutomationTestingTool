import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
    // Suppress deprecation warnings
    hmr: {
      overlay: true
    },
  },
  // Custom dev server to suppress deprecation warnings
  optimizeDeps: {
    // This helps avoid the util._extend deprecation warning
    exclude: ['util']
  },
})
