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
    emptyOutDir: true
  }
  // No proxy needed — in dev, Vite runs as middleware inside Express
  // so /api requests hit Express directly on the same port.
});
