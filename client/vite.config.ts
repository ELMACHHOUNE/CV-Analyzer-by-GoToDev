import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('lucide-react')) {
            return 'lucide-react';
          }
          if (id.includes('@vercel/analytics')) {
            return 'vercel-analytics';
          }
        },
      },
    },
    // Disable source maps in production
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})
