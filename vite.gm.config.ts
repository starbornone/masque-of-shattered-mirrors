import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: path.resolve(import.meta.dirname, 'gm'),
  base: '/gm/',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'rules-index', test: /[\\/]content[\\/](?:spell-labels|feat-labels|feat-progression|ancestry-options)\.json$/ }] } },
    },
    outDir: path.resolve(import.meta.dirname, 'dist-gm'),
    emptyOutDir: true,
  },
})
