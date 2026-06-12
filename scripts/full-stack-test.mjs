/**
 * LÜNA WASH — Full-stack integration test
 * Run: node scripts/full-stack-test.mjs
 */
import '../server/env.js';

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const API = `${BASE}/api`;

const results = [];
let passed = 0;
let failed = 0;

function log(icon, name, detail = '') {
  const line = `${icon} ${name}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push(line);
}

async function request(method, path, { body, token, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, ok: res.ok, data };
}

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    log('✅', name, detail);
    return true;
  }
  failed++;
  log('❌', name, detail);
  return false;
}

async function run() {
  console.log('\n🌙 LÜNA WASH — Full Stack Test\n');
  console.log(`Target: ${BASE}\n`);

  // ── 1. Frontend ──────────────────────────────────────────────────────────
  try {
    const html = await fetch(BASE);
    const text = await html.text();
    assert('Frontend loads', html.ok && text.includes('LÜNA WASH'));
    assert('React root present', text.includes('id="root"'));
  } catch (e) {
    assert('Frontend loads', false, e.message);
  }

  // ── 2. Health ────────────────────────────────────────────────────────────
  const health = await request('GET', '/health');
  assert('GET /api/health', health.ok, `mode=${health.data?.mode}`);
  assert('Supabase connected', health.data?.mode === 'supabase-full', health.data?.mode);
  assert('Database ping ok', health.data?.database?.status === 'ok', health.data?.database?.status);

  // ── 3. Catalog ───────────────────────────────────────────────────────────
  const services = await request('GET', '/services');
  assert('GET /api/services', services.ok);
  assert('Services from DB', services.data?.services?.length === 4, `${services.data?.services?.length} services`);
  assert('Services have UUIDs', services.data?.services?.every((s) => s.id));

  const plans = await request('GET', '/plans');
  assert('GET /api/plans', plans.ok);
  assert('Plans from DB', plans.data?.plans?.length === 3, `${plans.data?.plans?.length} plans`);
  assert('Premium is featured', plans.data?.plans?.some((p) => p.name === 'Premium' && p.is_featured));

  const plansAlias = await request('GET', '/services/plans');
  assert('GET /api/services/plans (alias)', plansAlias.ok);

  // ── 4. Guest booking ─────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);
  const guestEmail = `guest-test-${Date.now()}@mailinator.com`;

  const booking = await request('POST', '/bookings', {
    body: {
      name: 'Stack Test Guest',
      email: guestEmail,
      phone: '03704747292',
      service: 'express',
      date: dateStr,
      plan: 'Basic',
      message: 'Full-stack integration test booking'
    }
  });
  assert('POST /api/bookings (guest)', booking.status === 201);
  assert('Booking saved to DB', booking.data?.booking?.id);
  assert('service_id linked', !!booking.data?.booking?.service_id);
  assert('plan_id linked', !!booking.data?.booking?.plan_id);
  const bookingId = booking.data?.booking?.id;

  // ── 5. Booking validation ────────────────────────────────────────────────
  const badBooking = await request('POST', '/bookings', {
    body: { name: 'X', email: 'bad', phone: '1', service: 'invalid', date: '2020-01-01' }
  });
  assert('Booking validation rejects bad input', badBooking.status === 400);

  // ── 6. Auth flow ─────────────────────────────────────────────────────────
  const testEmail = `stacktest-${Date.now()}@mailinator.com`;
  const testPassword = 'TestPass123!';

  const register = await request('POST', '/auth/register', {
    body: { name: 'Stack Tester', email: testEmail, password: testPassword }
  });

  const regOk = register.status === 201;
  assert('POST /api/auth/register', regOk, register.data?.message || `status ${register.status}`);

  let token = register.data?.session?.access_token || null;
  const needsConfirm = register.data?.requiresConfirmation;

  const signIn = await request('POST', '/auth/sign-in', {
    body: { email: testEmail, password: testPassword }
  });

  if (!token && signIn.ok) {
    token = signIn.data?.session?.access_token;
  }

  if (needsConfirm && !token) {
    assert('POST /api/auth/sign-in (email confirm gate)', signIn.status === 401, 'confirmation required — expected');
    log('⚠️', 'Email confirmation is ON in Supabase — disable it in Auth settings for instant sign-in during dev');
  } else {
    assert('POST /api/auth/sign-in', signIn.ok, signIn.data?.message || '');
  }

  if (token) {
    const me = await request('GET', '/auth/me', { token });
    assert('GET /api/auth/me', me.ok);
    assert('Auth user email matches', me.data?.user?.email === testEmail);

    const authBooking = await request('POST', '/bookings', {
      token,
      body: {
        name: 'Stack Tester',
        email: testEmail,
        phone: '03704747292',
        service: 'dry',
        date: dateStr,
        plan: 'Premium',
        message: 'Authenticated booking test',
        profile_id: me.data?.user?.id
      }
    });
    assert('POST /api/bookings (authenticated)', authBooking.status === 201);

    const myBookings = await request('GET', '/bookings', { token });
    assert('GET /api/bookings (authenticated)', myBookings.ok);
    assert('User sees own bookings', myBookings.data?.bookings?.length >= 1, `${myBookings.data?.bookings?.length} booking(s)`);

    const noAuth = await request('GET', '/bookings');
    assert('GET /api/bookings requires auth', noAuth.status === 401);
  } else {
    log('⚠️', 'Skipping authenticated tests — no session token (email confirmation may be on)');
  }

  // ── 7. Single booking + status history ───────────────────────────────────
  if (bookingId) {
    const single = await request('GET', `/bookings/${bookingId}`);
    assert('GET /api/bookings/:id', single.ok);
    assert('Status history exists', Array.isArray(single.data?.history));
  }

  // ── 8. Contact ───────────────────────────────────────────────────────────
  const contact = await request('POST', '/contact', {
    body: {
      name: 'Stack Tester',
      email: guestEmail,
      subject: 'Integration Test',
      message: 'This is a full-stack contact form test message.'
    }
  });
  assert('POST /api/contact', contact.status === 201);

  const badContact = await request('POST', '/contact', {
    body: { name: 'A', email: 'bad', subject: 'Hi', message: 'short' }
  });
  assert('Contact validation rejects bad input', badContact.status === 400);

  // ── 9. 404 ────────────────────────────────────────────────────────────────
  const notFound = await request('GET', '/nonexistent');
  assert('API 404 for unknown route', notFound.status === 404);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('─'.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
