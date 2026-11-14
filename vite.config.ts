import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { localGm } from './server/gm-local.ts'
import { playerOffline } from './build/offline.ts'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'rules-index', test: /[\\/]content[\\/](?:spell-labels|feat-labels|feat-progression|ancestry-options)\.json$/ }] } },
    },
  },
  plugins: [localGm(), react(), tailwindcss(), playerOffline()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
