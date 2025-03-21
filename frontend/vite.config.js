import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      'process.env': env
    },
    optimizeDeps: {
      include: [
        '@tanstack/react-query',
        'react-hook-form',
        '@hookform/resolvers',
        'yup'
      ],
    },
  }
})
