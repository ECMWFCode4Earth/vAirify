import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),glsl()],
})
