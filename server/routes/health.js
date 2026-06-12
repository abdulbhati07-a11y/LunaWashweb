/**
 * Health check — /api/health
 * GET /api/health
 *
 * Returns service status and a live database ping.
 * Safe to expose publicly — no sensitive data returned.
 */
import { Router } from 'express';
import {
  isSupabaseAuthConfigured,
  isSupabaseAdminConfigured,
  isSupabaseFullyConfigured,
  supabaseAdmin
} from '../supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  let dbStatus = 'memory';
  let dbLatencyMs = null;

  if (isSupabaseAdminConfigured) {
    const start = Date.now();
    try {
      const { error } = await supabaseAdmin
        .from('services')
        .select('id')
        .limit(1);

      dbLatencyMs = Date.now() - start;
      dbStatus = error ? 'degraded' : 'ok';
    } catch {
      dbLatencyMs = Date.now() - start;
      dbStatus = 'error';
    }
  }

  const mode = isSupabaseFullyConfigured
    ? 'supabase-full'
    : isSupabaseAuthConfigured
    ? 'supabase-auth-only'
    : isSupabaseAdminConfigured
    ? 'supabase-admin-only'
    : 'memory';

  res.json({
    status: 'ok',
    service: 'luna-wash-api',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    mode,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs
    },
    features: {
      auth:     isSupabaseAuthConfigured,
      bookings: isSupabaseAdminConfigured,
      admin:    isSupabaseAdminConfigured
    }
  });
}));

export default router;
