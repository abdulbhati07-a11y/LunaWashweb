/**
 * Plans routes — /api/plans
 * GET /api/plans — list all active subscription plans
 */
import { Router } from 'express';
import { isSupabaseAdminConfigured, supabaseAdmin } from '../supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const STATIC_PLANS = [
  { name: 'Basic', monthly_price: 29, annual_price: 290, is_featured: false, display_order: 1, features: ['1 pickup per week', 'Express wash service', 'Free folding', 'Dry cleaning not included'] },
  { name: 'Premium', monthly_price: 59, annual_price: 590, is_featured: true, display_order: 2, features: ['2 pickups per week', 'Express wash service', 'Dry cleaning included', 'Ironing service'] },
  { name: 'Elite', monthly_price: 99, annual_price: 990, is_featured: false, display_order: 3, features: ['Unlimited pickups', 'All services included', 'Priority processing', '24/7 support'] }
];

router.get('/', asyncHandler(async (_req, res) => {
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
