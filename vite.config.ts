import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves a project site from https://<user>.github.io/<repo>/.
// In GitHub Actions, GITHUB_REPOSITORY is "owner/repo", so renaming the repo can't break asset paths.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'pokemon-battle-calc'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  // (`vite preview` runs as 'serve', so check isPreview too.)
  base: command === 'build' || isPreview ? `/${repoName}/` : '/',
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
}))
