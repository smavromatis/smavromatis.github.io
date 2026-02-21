import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import photoManifestPlugin from './vite-plugin-photo-manifest.js'
import archivePlugin from './vite-plugin-archive.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    photoManifestPlugin(),
    archivePlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'motion', 'lenis', 'ogl'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight', 'rehype-raw', 'rehype-sanitize']
        }
      }
    }
  }
})
