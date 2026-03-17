alter table public.listings
  add column if not exists top_until timestamptz,
  add column if not exists highlighted_until timestamptz;
