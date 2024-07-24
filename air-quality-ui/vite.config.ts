import path from 'path'

import { fileURLToPath } from 'url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'data_textures',
  ),
})
