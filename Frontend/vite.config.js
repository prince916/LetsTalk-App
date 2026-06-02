import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server:{
    port: 4001,
    Proxy: {
      '/api': {
        target: "http://localhost:5002",
        ChangeOrigin: true,
      }
    }
  }
})
