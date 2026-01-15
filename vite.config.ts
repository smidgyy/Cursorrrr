import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Change 'YOUR_REPO_NAME' to the name of your GitHub repository (e.g., 'pump-clicker')
  // If you are deploying to https://username.github.io/my-app/, this should be '/my-app/'
  base: '/YOUR_REPO_NAME/', 
})