import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  root,
  // Load VITE_* vars from the monorepo root .env (shared with Express)
  envDir: path.resolve(root, '..'),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Raise the warning threshold — Three.js is legitimately large
    // but we're splitting it into its own cached chunk below
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js (~500KB) gets its own chunk so it's separately cached
          'vendor-three': ['three'],
          // React runtime in its own chunk
          'vendor-react': ['react', 'react-dom'],
        }
      }
    }
  }
  // No proxy needed — in dev, Vite runs as middleware inside Express
  // so /api requests hit Express directly on the same port.
});
