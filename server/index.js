/**
 * LÜNA WASH — Unified Server Entry Point
 *
 * Development : Vite dev middleware runs inside Express (HMR, fast refresh)
 * Production  : Express serves the built SPA from luna-wash/dist via sirv
 *
 * Middleware order:
 *   1. CORS + JSON parsing          (app.js)
 *   2. Rate limiting                (app.js)
 *   3. /api/* routes                (app.js)
 *   4. /api/* 404 handler           (app.js)
 *   5. Global API error handler     (app.js)
 *   6. Vite dev middleware OR sirv  (here — catches all non-API routes)
 */

import './env.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import {
  isSupabaseAuthConfigured,
  isSupabaseAdminConfigured,
  isSupabaseFullyConfigured
} from './supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 3000;
const isProd    = process.env.NODE_ENV === 'production';

function logEnvStatus() {
  const mode = isSupabaseFullyConfigured
    ? 'supabase-full'
    : isSupabaseAuthConfigured
    ? 'supabase-auth-only'
    : isSupabaseAdminConfigured
    ? 'supabase-admin-only'
    : 'memory';

  console.log(`   Env mode  →  ${mode}`);
  if (!isSupabaseFullyConfigured) {
    console.warn('   ⚠️  Supabase not fully configured — check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

async function start() {
  logEnvStatus();

  if (isProd) {
    // ── Production ──────────────────────────────────────────────────────────
    const { default: sirv } = await import('sirv');
    const distPath = path.resolve(__dirname, '../luna-wash/dist');

    // Serve static assets; `single: true` falls back to index.html for SPA routing
    app.use(sirv(distPath, { single: true, dev: false }));

    app.listen(PORT, () => {
      console.log(`🌙 LÜNA WASH  →  http://127.0.0.1:${PORT}`);
    });

  } else {
    // ── Development ──────────────────────────────────────────────────────────
    const { createServer: createViteServer } = await import('vite');
    const viteRoot = path.resolve(__dirname, '../luna-wash');

    const vite = await createViteServer({
      configFile: path.resolve(viteRoot, 'vite.config.js'),
      server: { middlewareMode: true },
      appType: 'spa',
      root: viteRoot
    });

    // Mount Vite AFTER all /api routes so it handles everything else
    app.use(vite.middlewares);

    app.listen(PORT, () => {
      console.log(`🌙 LÜNA WASH (dev)  →  http://127.0.0.1:${PORT}`);
      console.log(`   Frontend  →  http://127.0.0.1:${PORT}`);
      console.log(`   API       →  http://127.0.0.1:${PORT}/api`);
    });
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
