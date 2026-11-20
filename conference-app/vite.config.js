import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sessions": "http://localhost:3001",
      "/cart": {
        target: "http://localhost:3001",
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept && req.headers.accept.includes("text/html")) {
            return "/index.html";
          }
        },
      },
    },
  },
})


