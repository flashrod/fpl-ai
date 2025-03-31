import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  theme: {
    extend: {
      colors: {
        'fpl-purple': '#37003c',
        'fpl-green': '#00ff87',
        'fpl-blue': '#04f5ff',
      },
    },
  },
  plugins: [react(),
    tailwindcss(),
  ],
})
