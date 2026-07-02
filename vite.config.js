import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise warning limit slightly — our lazy chunks are intentionally larger
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — changes rarely, long-lived browser cache
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // Framer Motion — heavy animation library, separate chunk
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }

          // Icon libraries
          if (id.includes('node_modules/lucide-react/') ||
              id.includes('node_modules/react-icons/')) {
            return 'vendor-icons';
          }

          // Zustand state management
          if (id.includes('node_modules/zustand/')) {
            return 'vendor-state';
          }

          // Admin dashboard — completely separate from storefront
          if (id.includes('/src/admin/')) {
            return 'chunk-admin';
          }
        },
      },
    },
  },
})
