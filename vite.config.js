import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the static build works from any GitHub Pages subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
  },
})
