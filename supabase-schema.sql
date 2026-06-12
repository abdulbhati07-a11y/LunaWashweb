-- ============================================================
--  LÜNA WASH — Supabase Database Schema
--  Version  : 3.0.0
--  Safe to re-run on an existing database (fully idempotent).
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;


-- ────────────────────────────────────────────────────────────
--  SHARED UTILITY FUNCTION
--  Auto-updates the updated_at column on every row change.
-- ────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────
--  TABLE: profiles
--  One row per authenticated user (mirrors auth.users).
--  Created / updated automatically on register & sign-in.
-- ────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '',
  email       text        not null unique,
  phone       text,
  avatar_url  text,
  role        text        not null default 'customer',
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint profiles_role_check
    check (role in ('customer', 'staff', 'admin'))
);

-- Migrate: add columns that may be missing on an existing table
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists is_active  boolean not null default true;

comment on table  public.profiles              is 'Extended user profile linked to Supabase auth.';
comment on column public.profiles.role         is 'customer | staff | admin';
comment on column public.profiles.avatar_url   is 'Public URL to the user profile picture.';


-- ────────────────────────────────────────────────────────────
--  TABLE: services
--  The four laundry service types offered by LÜNA WASH.
--  Seeded below; managed via Supabase dashboard or admin API.
-- ────────────────────────────────────────────────────────────

create table if not exists public.services (
  id            uuid        primary key default gen_random_uuid(),
  code          text        not null unique,
  name          text        not null,
  description   text        not null default '',
  base_price    numeric(10,2),
  icon          text,
  is_active     boolean     not null default true,
  display_order integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint services_code_format
    check (code ~ '^[a-z_]+$')
);

-- Migrate: add columns that may be missing on an existing table
alter table public.services
  add column if not exists icon       text,
  add column if not exists base_price numeric(10,2);

comment on table  public.services            is 'Laundry service types (express, dry, ironing, stain).';
comment on column public.services.code       is 'Unique short identifier used in booking forms.';
comment on column public.services.icon       is 'Emoji or icon identifier shown in the UI.';
comment on column public.services.base_price is 'Starting price shown on the services section (nullable = contact for pricing).';


-- ────────────────────────────────────────────────────────────
--  TABLE: plans
--  Subscription tiers shown on the Pricing section.
-- ────────────────────────────────────────────────────────────

create table if not exists public.plans (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null unique,
  monthly_price numeric(10,2) not null,
  annual_price  numeric(10,2) not null,
  description   text        not null default '',
  features      jsonb       not null default '[]'::jsonb,
  pickup_limit  integer,
  is_featured   boolean     not null default false,
  is_active     boolean     not null default true,
  display_order integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint plans_monthly_price_positive check (monthly_price >= 0),
  constraint plans_annual_price_positive  check (annual_price  >= 0)
);

-- Migrate: add columns that may be missing on an existing table
alter table public.plans
  add column if not exists pickup_limit integer,
  add column if not exists description  text not null default '';

comment on table  public.plans              is 'Subscription pricing plans (Basic, Premium, Elite).';
comment on column public.plans.features     is 'JSON array of feature strings displayed in the pricing cards.';
comment on column public.plans.pickup_limit is 'Max pickups per week (null = unlimited).';


-- ────────────────────────────────────────────────────────────
--  TABLE: customer_addresses
--  Saved delivery/pickup addresses for registered customers.
-- ────────────────────────────────────────────────────────────

create table if not exists public.customer_addresses (
  id            uuid        primary key default gen_random_uuid(),
  profile_id    uuid        not null references public.profiles (id) on delete cascade,
  label         text        not null default 'Home',
  contact_name  text        not null,
  phone         text        not null,
  address_line  text        not null,
  city          text        not null default 'Lahore',
  area          text,
  is_default    boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.customer_addresses            is 'Saved pickup/delivery addresses per customer profile.';
comment on column public.customer_addresses.label      is 'Display name e.g. Home, Office, Parents.';
comment on column public.customer_addresses.is_default is 'Whether this is the customer''s default address.';


-- ────────────────────────────────────────────────────────────
--  TABLE: bookings
--  Core table — every service booking made through the site.
-- ────────────────────────────────────────────────────────────

create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),

  -- Optional FK links (set when the customer is logged in)
  profile_id    uuid        references public.profiles          (id) on delete set null,
  service_id    uuid        references public.services          (id) on delete set null,
  plan_id       uuid        references public.plans             (id) on delete set null,
  address_id    uuid        references public.customer_addresses(id) on delete set null,

  -- Always-present customer details (captured even for guests)
  name          text        not null,
  email         text        not null,
  phone         text        not null,

  -- Service details
  service       text        not null,   -- matches services.code
  pickup_date   date        not null,
  pickup_window text,                   -- e.g. "Morning (8am–12pm)"
  message       text        not null default '',
  plan          text,                   -- matches plans.name (text copy for display)

  -- Financials
  total_amount  numeric(10,2),

  -- Lifecycle
  status        text        not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint bookings_status_check
    check (status in ('pending','confirmed','picked_up','in_progress','ready','delivered','cancelled')),
  constraint bookings_email_format
    check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Migrate: add every column that may be missing on an existing bookings table
alter table public.bookings
  add column if not exists profile_id    uuid        references public.profiles          (id) on delete set null,
  add column if not exists service_id    uuid        references public.services          (id) on delete set null,
  add column if not exists plan_id       uuid        references public.plans             (id) on delete set null,
  add column if not exists address_id    uuid        references public.customer_addresses(id) on delete set null,
  add column if not exists pickup_window text,
  add column if not exists total_amount  numeric(10,2),
  add column if not exists updated_at    timestamptz not null default now();

-- Ensure message column is not null (old schema allowed null)
update public.bookings set message = '' where message is null;
alter table public.bookings alter column message set not null;
alter table public.bookings alter column message set default '';

-- Add status constraint if it doesn't exist yet
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where  conname = 'bookings_status_check'
      and  conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_status_check
      check (status in ('pending','confirmed','picked_up','in_progress','ready','delivered','cancelled'));
  end if;
end $$;

comment on table  public.bookings               is 'Every booking request submitted through the website.';
comment on column public.bookings.status        is 'Lifecycle: pending → confirmed → picked_up → in_progress → ready → delivered (or cancelled).';
comment on column public.bookings.pickup_window is 'Optional preferred time window e.g. Morning, Afternoon, Evening.';
comment on column public.bookings.total_amount  is 'Calculated order total (set when confirmed).';


-- ────────────────────────────────────────────────────────────
--  TABLE: booking_items
--  Line-item breakdown for a booking (quantity, price each).
--  Populated by staff after pickup when items are counted.
-- ────────────────────────────────────────────────────────────

create table if not exists public.booking_items (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings (id) on delete cascade,
  service_id  uuid        references public.services (id) on delete set null,
  item_name   text        not null,
  quantity    integer     not null default 1,
  unit_price  numeric(10,2),
  subtotal    numeric(10,2) generated always as (quantity * coalesce(unit_price, 0)) stored,
  notes       text        not null default '',
  created_at  timestamptz not null default now(),

  constraint booking_items_quantity_positive check (quantity > 0)
);

-- Migrate: add subtotal generated column if missing
-- (generated columns cannot use ADD COLUMN IF NOT EXISTS in older PG,
--  so we guard with a DO block)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where  table_schema = 'public'
      and  table_name   = 'booking_items'
      and  column_name  = 'subtotal'
  ) then
    alter table public.booking_items
      add column subtotal numeric(10,2)
        generated always as (quantity * coalesce(unit_price, 0)) stored;
  end if;
end $$;

comment on table  public.booking_items          is 'Individual item lines within a booking (shirts, trousers, etc.).';
comment on column public.booking_items.subtotal is 'Auto-computed column: quantity × unit_price.';


-- ────────────────────────────────────────────────────────────
--  TABLE: booking_status_events
--  Full audit trail of every status change on a booking.
-- ────────────────────────────────────────────────────────────

create table if not exists public.booking_status_events (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings (id) on delete cascade,
  status      text        not null,
  note        text        not null default '',
  changed_by  uuid        references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),

  constraint booking_status_events_status_check
    check (status in ('pending','confirmed','picked_up','in_progress','ready','delivered','cancelled'))
);

-- Migrate: add changed_by if missing
alter table public.booking_status_events
  add column if not exists changed_by uuid references public.profiles (id) on delete set null;

comment on table  public.booking_status_events            is 'Immutable audit log of booking status transitions.';
comment on column public.booking_status_events.changed_by is 'Profile ID of the staff/admin who changed the status (null = system/customer).';


-- ────────────────────────────────────────────────────────────
--  TABLE: contact_enquiries
--  Messages submitted via the Contact / Book Now section.
-- ────────────────────────────────────────────────────────────

create table if not exists public.contact_enquiries (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  subject     text        not null,
  message     text        not null,
  is_read     boolean     not null default false,
  replied_at  timestamptz,
  created_at  timestamptz not null default now(),

  constraint contact_enquiries_email_format
    check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Migrate: add columns that may be missing on an existing table
alter table public.contact_enquiries
  add column if not exists subject    text not null default '',
  add column if not exists replied_at timestamptz;

-- Back-fill subject for any old rows that have an empty default
update public.contact_enquiries set subject = 'General Enquiry' where subject = '';

comment on table  public.contact_enquiries            is 'General enquiries submitted through the contact form.';
comment on column public.contact_enquiries.is_read    is 'Marked true once an admin has viewed the message.';
comment on column public.contact_enquiries.replied_at is 'Timestamp of when a reply was sent (nullable).';


-- ────────────────────────────────────────────────────────────
--  INDEXES
--  Covering the most common query patterns in the API.
-- ────────────────────────────────────────────────────────────

-- profiles
create index if not exists idx_profiles_email
  on public.profiles (lower(email));

create index if not exists idx_profiles_role
  on public.profiles (role) where is_active = true;

-- services
create index if not exists idx_services_active_order
  on public.services (is_active, display_order);

-- plans
create index if not exists idx_plans_active_order
  on public.plans (is_active, display_order);

-- customer_addresses
create index if not exists idx_addresses_profile
  on public.customer_addresses (profile_id);

-- bookings
create index if not exists idx_bookings_email_created
  on public.bookings (lower(email), created_at desc);

create index if not exists idx_bookings_profile_created
  on public.bookings (profile_id, created_at desc);

create index if not exists idx_bookings_status
  on public.bookings (status);

create index if not exists idx_bookings_pickup_date
  on public.bookings (pickup_date);

-- booking_items
create index if not exists idx_booking_items_booking
  on public.booking_items (booking_id);

-- booking_status_events
create index if not exists idx_status_events_booking_created
  on public.booking_status_events (booking_id, created_at desc);

-- contact_enquiries
create index if not exists idx_enquiries_email
  on public.contact_enquiries (lower(email));

create index if not exists idx_enquiries_unread
  on public.contact_enquiries (created_at desc) where is_read = false;


-- ────────────────────────────────────────────────────────────
--  TRIGGERS — auto-update updated_at on every row change
-- ────────────────────────────────────────────────────────────

drop trigger if exists trg_profiles_updated_at           on public.profiles;
drop trigger if exists trg_services_updated_at           on public.services;
drop trigger if exists trg_plans_updated_at              on public.plans;
drop trigger if exists trg_customer_addresses_updated_at on public.customer_addresses;
drop trigger if exists trg_bookings_updated_at           on public.bookings;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger trg_plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

create trigger trg_customer_addresses_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();


-- ────────────────────────────────────────────────────────────
--  FUNCTION: auto-create profile on new user signup
--  Triggered by Supabase Auth when a user confirms their email.
--  Eliminates the need for the server to call upsertProfile().
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(new.email)
  )
  on conflict (id) do update
    set
      full_name  = coalesce(excluded.full_name, public.profiles.full_name),
      email      = excluded.email,
      updated_at = now();
  return new;
end;
$$;

-- Attach to auth.users (safe to re-run)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ────────────────────────────────────────────────────────────
--  FUNCTION: auto-recalculate booking total_amount
--  Fires whenever a booking_item is inserted, updated or deleted.
-- ────────────────────────────────────────────────────────────

create or replace function public.refresh_booking_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
begin
  v_booking_id := coalesce(new.booking_id, old.booking_id);

  update public.bookings
  set total_amount = (
    select coalesce(sum(subtotal), 0)
    from   public.booking_items
    where  booking_id = v_booking_id
  )
  where id = v_booking_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_refresh_booking_total on public.booking_items;
create trigger trg_refresh_booking_total
  after insert or update or delete on public.booking_items
  for each row execute function public.refresh_booking_total();


-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table public.profiles           enable row level security;
alter table public.services           enable row level security;
alter table public.plans              enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_items      enable row level security;
alter table public.booking_status_events enable row level security;
alter table public.contact_enquiries  enable row level security;

-- Drop all existing policies so this script is idempotent
do $drop_policies$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from   pg_policies
    where  schemaname = 'public'
      and  tablename in (
             'profiles','services','plans','customer_addresses',
             'bookings','booking_items','booking_status_events','contact_enquiries'
           )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $drop_policies$;

-- ── profiles ────────────────────────────────────────────────

-- Service role (used by Express server) can do anything
create policy "service_role_all_profiles"
  on public.profiles for all
  to service_role
  using (true)
  with check (true);

-- Logged-in users can read and update only their own profile
create policy "user_select_own_profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "user_update_own_profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── services ────────────────────────────────────────────────

-- Anyone (including guests) can read active services
create policy "public_read_active_services"
  on public.services for select
  using (is_active = true);

-- Only service role can modify
create policy "service_role_all_services"
  on public.services for all
  to service_role
  using (true)
  with check (true);

-- ── plans ───────────────────────────────────────────────────

-- Anyone can read active plans
create policy "public_read_active_plans"
  on public.plans for select
  using (is_active = true);

-- Only service role can modify
create policy "service_role_all_plans"
  on public.plans for all
  to service_role
  using (true)
  with check (true);

-- ── customer_addresses ──────────────────────────────────────

-- Service role full access
create policy "service_role_all_addresses"
  on public.customer_addresses for all
  to service_role
  using (true)
  with check (true);

-- Customers can manage only their own addresses
create policy "user_select_own_addresses"
  on public.customer_addresses for select
  to authenticated
  using (profile_id = auth.uid());

create policy "user_insert_own_addresses"
  on public.customer_addresses for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "user_update_own_addresses"
  on public.customer_addresses for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "user_delete_own_addresses"
  on public.customer_addresses for delete
  to authenticated
  using (profile_id = auth.uid());

-- ── bookings ────────────────────────────────────────────────

-- Service role full access (Express server uses this)
create policy "service_role_all_bookings"
  on public.bookings for all
  to service_role
  using (true)
  with check (true);

-- Authenticated customers can read their own bookings
create policy "user_select_own_bookings"
  on public.bookings for select
  to authenticated
  using (profile_id = auth.uid() or lower(email) = lower(auth.jwt()->>'email'));

-- Guests and customers can create bookings
create policy "anyone_insert_bookings"
  on public.bookings for insert
  with check (true);

-- ── booking_items ───────────────────────────────────────────

-- Service role full access
create policy "service_role_all_booking_items"
  on public.booking_items for all
  to service_role
  using (true)
  with check (true);

-- Customers can read items for their own bookings
create policy "user_select_own_booking_items"
  on public.booking_items for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where  b.id = booking_id
        and  (b.profile_id = auth.uid() or lower(b.email) = lower(auth.jwt()->>'email'))
    )
  );

-- ── booking_status_events ───────────────────────────────────

-- Service role full access
create policy "service_role_all_status_events"
  on public.booking_status_events for all
  to service_role
  using (true)
  with check (true);

-- Customers can read status history for their own bookings
create policy "user_select_own_status_events"
  on public.booking_status_events for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where  b.id = booking_id
        and  (b.profile_id = auth.uid() or lower(b.email) = lower(auth.jwt()->>'email'))
    )
  );

-- ── contact_enquiries ───────────────────────────────────────

-- Service role full access (read, reply, mark as read)
create policy "service_role_all_enquiries"
  on public.contact_enquiries for all
  to service_role
  using (true)
  with check (true);

-- Anyone can submit a contact enquiry (INSERT only, no read)
create policy "anyone_insert_enquiry"
  on public.contact_enquiries for insert
  with check (true);


-- ────────────────────────────────────────────────────────────
--  SEED DATA
--  Upserted so re-running this file never creates duplicates.
-- ────────────────────────────────────────────────────────────

-- Services
insert into public.services (code, name, description, icon, base_price, display_order)
values
  ('express', 'Express Wash',    'Quick turnaround wash and fold service. Get your clothes cleaned and ready in 24 hours.',                '🧼', null, 1),
  ('dry',     'Dry Cleaning',    'Professional dry cleaning for delicate fabrics. Expert care for your finest garments.',                  '🧥', null, 2),
  ('ironing', 'Ironing Service', 'Expert ironing and pressing. Perfectly pressed clothes ready for any occasion.',                         '👔', null, 3),
  ('stain',   'Stain Removal',   'Advanced stain treatment. We handle tough stains with professional-grade solutions.',                    '✨', null, 4)
on conflict (code) do update set
  name          = excluded.name,
  description   = excluded.description,
  icon          = excluded.icon,
  display_order = excluded.display_order,
  updated_at    = now();

-- Plans
insert into public.plans (name, monthly_price, annual_price, features, pickup_limit, is_featured, display_order)
values
  (
    'Basic', 29, 290,
    '["1 pickup per week","Express wash service","Free folding","Dry cleaning not included"]'::jsonb,
    1, false, 1
  ),
  (
    'Premium', 59, 590,
    '["2 pickups per week","Express wash service","Dry cleaning included","Ironing service"]'::jsonb,
    2, true, 2
  ),
  (
    'Elite', 99, 990,
    '["Unlimited pickups","All services included","Priority processing","24/7 support"]'::jsonb,
    null, false, 3
  )
on conflict (name) do update set
  monthly_price = excluded.monthly_price,
  annual_price  = excluded.annual_price,
  features      = excluded.features,
  pickup_limit  = excluded.pickup_limit,
  is_featured   = excluded.is_featured,
  display_order = excluded.display_order,
  updated_at    = now();


-- ────────────────────────────────────────────────────────────
--  DONE
-- ────────────────────────────────────────────────────────────
-- Tables   : profiles, services, plans, customer_addresses,
--            bookings, booking_items, booking_status_events,
--            contact_enquiries
-- Triggers : set_updated_at (5 tables)
--            handle_new_user (auth.users → profiles)
--            refresh_booking_total (booking_items → bookings)
-- Indexes  : 13 covering all common query patterns
-- RLS      : All 8 tables — service_role bypass + user isolation
-- Seed     : 4 services, 3 plans (idempotent upserts)
-- ────────────────────────────────────────────────────────────
--
--  ⚠️  EMAIL CONFIRMATION NOTE
--  By default Supabase requires users to confirm their email before
--  they can sign in. During development you likely want to turn this off.
--
--  To disable email confirmation:
--    Supabase Dashboard → Authentication → Providers → Email
--    → Toggle OFF "Confirm email"
--
--  When confirmation is OFF:
--    → signUp() returns a valid session immediately
--    → Users are signed in right after registering
--
--  When confirmation is ON (production default):
--    → signUp() returns user but session = null
--    → The API returns { requiresConfirmation: true }
--    → The frontend shows "Check your email" instead of signing in
-- ────────────────────────────────────────────────────────────
