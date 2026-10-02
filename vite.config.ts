import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site from https://<user>.github.io/poke-battle-calc/
  // (`vite preview` runs as 'serve', so check isPreview too.)
  base: command === 'build' || isPreview ? '/poke-battle-calc/' : '/',
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
}))
