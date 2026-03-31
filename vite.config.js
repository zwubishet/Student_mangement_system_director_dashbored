import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Explicitly include the internal paths if needed, 
    // though usually just the main entry works after a cache clear.
    include: ['@apollo/client/core', '@apollo/client/cache'],
    exclude: ['@apollo/client'] // Force Vite to handle it via standard resolution
  },
})