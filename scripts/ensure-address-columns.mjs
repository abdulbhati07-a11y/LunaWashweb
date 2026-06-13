/**
 * Check if address columns exist; apply migration via pg if SUPABASE_DB_URL is set.
 */
import '../server/env.js';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../server/supabase.js';

const ALTER_SQL = `
alter table public.bookings
  add column if not exists pickup_address text not null default '',
  add column if not exists area           text,
  add column if not exists city           text not null default 'Lahore';
`;

export async function ensureAddressColumns() {
  if (!isSupabaseAdminConfigured) return { ok: true, mode: 'memory' };

  const probe = await supabaseAdmin.from('bookings').select('pickup_address').limit(1);
  if (!probe.error) return { ok: true, mode: 'exists' };

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    return { ok: false, mode: 'missing', sql: ALTER_SQL.trim() };
  }

  const pg = await import('pg');
  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(ALTER_SQL);
  await client.end();
  return { ok: true, mode: 'migrated' };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  ensureAddressColumns()
    .then((result) => {
      if (result.ok) {
        console.log(`✅ Address columns ready (${result.mode})`);
        process.exit(0);
      }
      console.error('❌ Address columns missing. Add SUPABASE_DB_URL to .env or run in Supabase SQL Editor:\n');
      console.error(result.sql);
      process.exit(1);
    })
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exit(1);
    });
}
