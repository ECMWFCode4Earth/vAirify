import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  server: {
    proxy: {
      // proxy requests to test retrieving data texture from deployed server 
      // otherwise prevented due to CORS policy issues
      '/volume': {
        target: 'http://64.225.143.231',
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/volume/, ''),
      }
    }
  }
});