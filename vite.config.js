import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/statnice-geografie/' to match your GitHub repo name
// For user pages (username.github.io) use '/'
export default defineConfig({
  plugins: [react()],
  base: '/statnice/',
})
