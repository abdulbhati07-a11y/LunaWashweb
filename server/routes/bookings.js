/**
 * Booking routes — /api/bookings
 * POST /api/bookings              — create a booking (public)
 * GET  /api/bookings              — list bookings (requires auth token or email match)
 * GET  /api/bookings/:id          — get single booking + status history
 * PATCH /api/bookings/:id/status  — update status (requires service_role header)
 * DELETE /api/bookings/:id        — cancel a booking
 */
import { Router } from 'express';
import { isSupabaseAdminConfigured, isSupabaseAuthConfigured, supabaseAdmin, supabaseAuth } from '../supabase.js';
import { validateBooking, isEmail } from '../middleware/validate.js';
import { bookingLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const VALID_STATUSES = ['pending', 'confirmed', 'picked_up', 'in_progress', 'ready', 'delivered', 'cancelled'];

// In-memory fallback
const memoryBookings = [];

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Resolve the caller from an Authorization: Bearer <token> header.
 * Returns { id, email } or null when Supabase auth is not configured / token missing.
 */
async function resolveUser(req) {
  if (!isSupabaseAuthConfigured) return null;
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) return null;
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email?.toLowerCase() };
}

/**
 * Check if the caller has the internal admin key.
 * Used to protect the status-update route.
 */
function isAdminRequest(req) {
  const key = req.headers['x-admin-key'];
  const adminKey = process.env.ADMIN_SECRET_KEY;
  // If no ADMIN_SECRET_KEY is set in .env, the route is open (dev mode).
  if (!adminKey) return true;
  return key === adminKey;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function addStatusEvent(bookingId, status, note, changedBy = null) {
  if (!isSupabaseAdminConfigured) return;
  await supabaseAdmin
    .from('booking_status_events')
    .insert({ booking_id: bookingId, status, note, changed_by: changedBy })
    .throwOnError();
}

function formatAddressFallback(booking) {
  return `[Pickup: ${booking.pickup_address}${booking.area ? `, ${booking.area}` : ''}, ${booking.city || 'Lahore'}]`;
}

async function insertBookingRecord(booking) {
  let { data, error } = await supabaseAdmin
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  // Graceful fallback when DB migration not applied yet
  if (error?.message?.includes('pickup_address') || error?.message?.includes("'area'")) {
    const { pickup_address, area, city, ...rest } = booking;
    const fallback = {
      ...rest,
      message: `${formatAddressFallback(booking)}${rest.message ? `\n${rest.message}` : ''}`.trim()
    };
    ({ data, error } = await supabaseAdmin.from('bookings').insert(fallback).select().single());
    if (data) {
      data.pickup_address = pickup_address;
      data.area = area;
      data.city = city || 'Lahore';
    }
  }

  return { data, error };
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 */
router.post('/', bookingLimiter, asyncHandler(async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const { name, email, phone, service, date, message, plan, profile_id, pickup_address, area, city } = req.body;

  const booking = {
    name:            name.trim(),
    email:           email.trim().toLowerCase(),
    phone:           phone.trim(),
    pickup_address:  pickup_address.trim(),
    area:            area?.trim() || null,
    city:            city?.trim() || 'Lahore',
    service,
    pickup_date:     date,
    message:         message?.trim() || '',
    plan:            plan || null,
    status:          'pending',
    profile_id:      profile_id || null,
    service_id:      null,
    plan_id:         null
  };

  if (isSupabaseAdminConfigured) {
    const { data: serviceRow } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('code', service)
      .maybeSingle();
    if (serviceRow?.id) booking.service_id = serviceRow.id;

    if (plan) {
      const { data: planRow } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('name', plan)
        .maybeSingle();
      if (planRow?.id) booking.plan_id = planRow.id;
    }

    const { data, error } = await insertBookingRecord(booking);

    if (error) return res.status(400).json({ message: error.message });

    try {
      await addStatusEvent(data.id, 'pending', 'Booking submitted by customer.');
    } catch { /* non-critical */ }

    return res.status(201).json({ booking: data });
  }

  // Memory fallback
  const record = { id: crypto.randomUUID(), ...booking, created_at: new Date().toISOString() };
  memoryBookings.push(record);
  res.status(201).json({ booking: record });
}));

/**
 * GET /api/bookings
 * Requires either:
 *   A) Authorization: Bearer <token>  → returns bookings for the token's user only
 *   B) ?email= query param            → only returns bookings matching that email
 *      (caller must be authenticated and the email must match their account,
 *       OR Supabase is not configured and we're in memory/dev mode)
 */
router.get('/', asyncHandler(async (req, res) => {
  const email  = req.query.email?.trim().toLowerCase();
  const status = req.query.status?.trim();
  const limit  = Math.min(parseInt(req.query.limit) || 50, 200);

  if (email && !isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  // Resolve caller identity from token
  const caller = await resolveUser(req);

  if (isSupabaseAuthConfigured) {
    // Must be authenticated or provide a matching email with a valid token
    if (!caller) {
      return res.status(401).json({ message: 'Authentication required to view bookings.' });
    }
    // Non-admin callers can only see their own bookings
    const effectiveEmail = caller.email;

    if (isSupabaseAdminConfigured) {
      let query = supabaseAdmin
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Always scope to the authenticated user's email
      query = query.eq('email', effectiveEmail);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return res.status(400).json({ message: error.message });
      return res.json({ bookings: data, count: data.length });
    }
  }

  // Memory fallback (dev mode — no auth check needed)
  let results = [...memoryBookings].reverse();
  if (email)  results = results.filter((b) => b.email === email);
  if (status) results = results.filter((b) => b.status === status);
  results = results.slice(0, limit);
  res.json({ bookings: results, count: results.length });
}));

/**
 * GET /api/bookings/:id
 * Returns the booking + its full status history
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isSupabaseAdminConfigured) {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const { data: history } = await supabaseAdmin
      .from('booking_status_events')
      .select('*')
      .eq('booking_id', id)
      .order('created_at', { ascending: true });

    return res.json({ booking, history: history || [] });
  }

  // Memory fallback
  const booking = memoryBookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json({ booking, history: [] });
}));

/**
 * PATCH /api/bookings/:id/status
 * Body: { status, note }
 * Protected: requires X-Admin-Key header matching ADMIN_SECRET_KEY env var.
 */
router.patch('/:id/status', asyncHandler(async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const { id } = req.params;
  const { status, note } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`
    });
  }

  if (isSupabaseAdminConfigured) {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    try {
      await addStatusEvent(id, status, note || `Status updated to ${status}.`);
    } catch { /* non-critical */ }

    return res.json({ booking });
  }

  // Memory fallback
  const booking = memoryBookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = status;
  res.json({ booking });
}));

/**
 * DELETE /api/bookings/:id
 * Cancels a booking (sets status to 'cancelled').
 * Full delete is intentionally avoided to preserve audit history.
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isSupabaseAdminConfigured) {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    try {
      await addStatusEvent(id, 'cancelled', 'Booking cancelled by customer.');
    } catch { /* non-critical */ }

    return res.json({ message: 'Booking cancelled.', booking });
  }

  // Memory fallback
  const booking = memoryBookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled';
  res.json({ message: 'Booking cancelled.', booking });
}));

export default router;
