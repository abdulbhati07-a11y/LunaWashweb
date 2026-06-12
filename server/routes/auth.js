/**
 * Auth routes — /api/auth
 * POST /api/auth/register
 * POST /api/auth/sign-in
 * POST /api/auth/sign-out
 * GET  /api/auth/me
 */
import { Router } from 'express';
import {
  isSupabaseAuthConfigured,
  isSupabaseAdminConfigured,
  supabaseAdmin,
  supabaseAuth
} from '../supabase.js';
import { validateRegister, validateSignIn } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const SITE_URL = (process.env.SITE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

// ── Helpers ───────────────────────────────────────────────────────────────────

function publicUser(user, fallbackName = '') {
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.name || fallbackName || user.email?.split('@')[0] || '',
    email: user.email,
    createdAt: user.created_at
  };
}

async function upsertProfile(user, fallbackName = '') {
  if (!isSupabaseAdminConfigured || !user?.id || !user?.email) return;
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id:        user.id,
        full_name: user.user_metadata?.name || fallbackName || user.email.split('@')[0],
        email:     user.email.toLowerCase(),
        role:      'customer'
      },
      { onConflict: 'id' }
    );
  if (error) throw new Error(error.message);
}

// In-memory fallback store (only used when Supabase is not configured)
const memoryUsers = [];

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Two possible Supabase outcomes:
 *   A) Email confirmation OFF → session returned immediately, user is signed in.
 *   B) Email confirmation ON  → session is null, user must confirm email first.
 *
 * Response always includes { user, session, requiresConfirmation }.
 * The frontend uses requiresConfirmation to show the right message.
 */
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const { name, email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const cleanName  = name.trim();

  if (isSupabaseAuthConfigured) {
    const { data, error } = await supabaseAuth.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: cleanName },
        emailRedirectTo: `${SITE_URL}/`
      }
    });

    if (error) return res.status(400).json({ message: error.message });

    // Supabase returns a user object even when confirmation is required.
    // If identities array is empty it means the email already exists.
    if (data?.user?.identities?.length === 0) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    if (!data?.user) {
      return res.status(400).json({ message: 'Registration failed. Please try again.' });
    }

    // session === null means email confirmation is required
    const requiresConfirmation = !data.session;

    // Always sync the profile — whether confirmed or not.
    // The trigger should handle it, but we do it explicitly here
    // as a guaranteed fallback using the service role key.
    try { await upsertProfile(data.user, cleanName); } catch (e) {
      console.warn('[upsertProfile register]', e?.message);
    }

    return res.status(201).json({
      user: publicUser(data.user, cleanName),
      session: data.session,
      requiresConfirmation,
      message: requiresConfirmation
        ? 'Account created! Please check your email and click the confirmation link, then sign in.'
        : 'Account created successfully. You are now signed in.'
    });
  }

  // ── Memory fallback ──────────────────────────────────────────────────────────
  if (memoryUsers.some((u) => u.email === cleanEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    createdAt: new Date().toISOString()
  };
  memoryUsers.push({ ...user, password });

  res.status(201).json({
    user,
    session: null,
    requiresConfirmation: false,
    message: 'Account created successfully. You are now signed in.'
  });
}));

/**
 * POST /api/auth/sign-in
 */
router.post('/sign-in', authLimiter, asyncHandler(async (req, res) => {
  const errors = validateSignIn(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseAuthConfigured) {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      // Give a specific hint when the user hasn't confirmed their email
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
        return res.status(401).json({
          message: 'Please confirm your email address first. Check your inbox for the confirmation link.'
        });
      }
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!data?.user) {
      return res.status(401).json({ message: 'Unable to sign in. Please try again.' });
    }

    try { await upsertProfile(data.user); } catch (e) {
      console.warn('[upsertProfile sign-in]', e?.message);
    }

    return res.json({
      user: publicUser(data.user),
      session: data.session,
      message: 'Welcome back! You are now signed in.'
    });
  }

  // ── Memory fallback ──────────────────────────────────────────────────────────
  const user = memoryUsers.find(
    (u) => u.email === cleanEmail && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    session: null,
    message: 'Welcome back! You are now signed in.'
  });
}));

/**
 * POST /api/auth/sign-out
 */
router.post('/sign-out', asyncHandler(async (_req, res) => {
  res.json({ message: 'Signed out successfully.' });
}));

/**
 * GET /api/auth/me  — returns profile for a given Supabase access token
 * Authorization: Bearer <access_token>
 */
router.get('/me', asyncHandler(async (req, res) => {
  if (!isSupabaseAuthConfigured) {
    return res.status(501).json({ message: 'Auth not configured.' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  res.json({ user: publicUser(data.user) });
}));

export default router;
