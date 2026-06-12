/**
 * Services & Plans routes — /api/services, /api/plans
 * GET /api/services  — list all active services
 * GET /api/plans     — list all active plans
 *
 * These power the frontend Services and Pricing sections.
 * Responses are sourced from the database when available,
 * falling back to the hardcoded values from the frontend.
 */
import { Router } from 'express';
import { isSupabaseAdminConfigured, supabaseAdmin } from '../supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// ── Static fallbacks (match frontend data exactly) ────────────────────────────

const STATIC_SERVICES = [
  { code: 'express', name: 'Express Wash',    description: 'Quick turnaround wash and fold service. Get your clothes cleaned and ready in 24 hours.',                 display_order: 1 },
  { code: 'dry',     name: 'Dry Cleaning',    description: 'Professional dry cleaning for delicate fabrics. Expert care for your finest garments.',                  display_order: 2 },
  { code: 'ironing', name: 'Ironing Service', description: 'Expert ironing and pressing. Perfectly pressed clothes ready for any occasion.',                         display_order: 3 },
  { code: 'stain',   name: 'Stain Removal',   description: 'Advanced stain treatment. We handle tough stains with professional-grade solutions.',                    display_order: 4 }
];

const STATIC_PLANS = [
  { name: 'Basic',   monthly_price: 29,  annual_price: 290,  is_featured: false, display_order: 1, features: ['1 pickup per week', 'Express wash service', 'Free folding', 'Dry cleaning not included'] },
  { name: 'Premium', monthly_price: 59,  annual_price: 590,  is_featured: true,  display_order: 2, features: ['2 pickups per week', 'Express wash service', 'Dry cleaning included', 'Ironing service'] },
  { name: 'Elite',   monthly_price: 99,  annual_price: 990,  is_featured: false, display_order: 3, features: ['Unlimited pickups', 'All services included', 'Priority processing', '24/7 support'] }
];

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/services
 */
router.get('/', asyncHandler(async (_req, res) => {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('id, code, name, description, icon, base_price, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data?.length) {
      return res.json({ services: data });
    }
    // Fall through to static data if DB query fails or returns nothing
  }

  res.json({ services: STATIC_SERVICES });
}));

/**
 * GET /api/plans
 */
router.get('/plans', asyncHandler(async (_req, res) => {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('id, name, monthly_price, annual_price, features, is_featured, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data?.length) {
      return res.json({ plans: data });
    }
  }

  res.json({ plans: STATIC_PLANS });
}));

export default router;
