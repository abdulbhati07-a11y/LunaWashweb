-- Run once in Supabase Dashboard → SQL Editor
alter table public.bookings
  add column if not exists pickup_address text not null default '',
  add column if not exists area           text,
  add column if not exists city           text not null default 'Lahore';
