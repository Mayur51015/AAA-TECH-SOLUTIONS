import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use subpath for GitHub Pages only when GITHUB_PAGES is set or during GitHub Actions deploy
  // Default to '/' for Vercel, Netlify, Render, Docker, and local development
  const isGithubPages = process.env.GITHUB_PAGES === 'true' || 
    (Boolean(process.env.GITHUB_ACTIONS) && !process.env.VERCEL);
  
  const base = process.env.VITE_BASE_PATH || (isGithubPages ? '/AAA-TECH-SOLUTIONS/' : '/');

  return {
    plugins: [react()],
    base,
    server: {
      port: 3000,
      open: false
    }
  };
})
