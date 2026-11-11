import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/** Emit gm/index.html as dist-gm/index.html while keeping the repo root for Tailwind. */
function flattenGmHtml(): Plugin {
  return {
    name: 'flatten-gm-html',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const nested = bundle['gm/index.html']
      if (!nested || nested.type !== 'asset') return
      nested.fileName = 'index.html'
    },
  }
}

export default defineConfig({
  base: '/gm/',
  publicDir: false,
  plugins: [react(), tailwindcss(), flattenGmHtml()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist-gm'),
    emptyOutDir: true,
    rolldownOptions: {
      input: path.resolve(import.meta.dirname, 'gm/index.html'),
      output: {
        codeSplitting: {
          groups: [{
            name: 'rules-index',
            test: /[\\/]content[\\/](?:spell-labels|feat-labels|feat-progression|ancestry-options)\.json$/,
          }],
        },
      },
    },
  },
})
