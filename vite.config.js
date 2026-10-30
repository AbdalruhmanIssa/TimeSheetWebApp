import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // keep the big libraries in their own cached chunks
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          charts: ['@mui/x-charts'],
          data: ['@tanstack/react-query', 'axios', 'zustand', 'react-hook-form', 'yup'],
        },
      },
    },
  },
})
