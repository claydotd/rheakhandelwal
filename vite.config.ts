import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seedWritePlugin } from './vite-plugin-seed'

// https://vite.dev/config/
// GitHub Pages default: /rheakhandelwal/
// Netlify / custom domain: VITE_BASE=/ npm run build
export default defineConfig({
  plugins: [react(), seedWritePlugin()],
  base: process.env.VITE_BASE || '/rheakhandelwal/',
})
