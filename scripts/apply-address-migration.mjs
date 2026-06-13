/**
 * Apply address columns to Supabase via direct Postgres connection.
 * Tries SUPABASE_DB_URL, or builds URI from SUPABASE_DB_PASSWORD + project ref.
 */
import '../server/env.js';
import pg from 'pg';

const SQL = `
alter table public.bookings
  add column if not exists pickup_address text not null default '',
  add column if not exists area           text,
  add column if not exists city           text not null default 'Lahore';
`;

function buildDbUrl() {
  if (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL) {
    return process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
  if (!password || !ref) return null;

  const host = process.env.SUPABASE_DB_HOST || `db.${ref}.supabase.co`;
  return `postgresql://postgres:${encodeURIComponent(password)}@${host}:5432/postgres`;
}

async function run() {
  const dbUrl = buildDbUrl();
  if (!dbUrl) {
    console.error('Set SUPABASE_DB_URL or SUPABASE_DB_PASSWORD in .env');
    console.error('Get password from: Supabase Dashboard → Settings → Database\n');
    console.error('Or run in SQL Editor:\n');
    console.error(SQL.trim());
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log('✅ Address columns applied.');
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
