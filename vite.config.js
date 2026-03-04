import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,           // Set your desired port
    open: true,           // Automatically open browser
    host: true,           // Expose to network (optional)
  },
  preview: {
    port: 3000,           // Same port for preview
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})