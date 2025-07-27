import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for browser-compatible crypto
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    process: {
      env: {}, // Prevent some polyfill errors
    },
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify', 'stream-browserify', 'buffer'],
  },
});
