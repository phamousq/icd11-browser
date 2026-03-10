import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/icdapi': {
        target: 'https://id.who.int',
        changeOrigin: true,
        rewrite: (path) => '/icd' + path.replace(/^\/icdapi/, ''),
      },
      '/connect': {
        target: 'https://icdaccessmanagement.who.int',
        changeOrigin: true,
      },
    },
  },
})
