import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^lucide-react$/, replacement: path.resolve(__dirname, 'src/utils/icons.js') }
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/dist/**', '**/.git/**', '**/*.log']
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
