/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { reticle } from '@reticlehq/vite-plugin';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reticle({ captureNetworkBodies: true }),react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
