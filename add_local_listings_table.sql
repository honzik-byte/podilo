-- Run this in your Supabase SQL Editor.
-- Replaces the file-based "local listings" storage (src/data/localListings.json)
-- with a real table. Writing to the filesystem doesn't work on Vercel's
-- serverless functions (read-only outside /tmp), so the old JSON-file
-- mechanism silently fails in production.

CREATE TABLE IF NOT EXISTS public.local_listings (
  id text PRIMARY KEY,
  title text NOT NULL,
  location text NOT NULL,
  street_address text,
  property_type text NOT NULL,
  share_size text NOT NULL,
  price numeric NOT NULL,
  full_property_value numeric,
  occupancy text,
  description_text text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  images text[] DEFAULT '{}',
  contact_email text NOT NULL,
  contact_phone text,
  lat double precision,
  lng double precision,
  is_top boolean DEFAULT false,
  is_highlighted boolean DEFAULT false,
  user_id uuid,
  top_until timestamptz,
  highlighted_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz
);

-- Accessed only through server routes using the service-role key
-- (see src/lib/localListings.ts), so RLS stays enabled with no public policies.
ALTER TABLE public.local_listings ENABLE ROW LEVEL SECURITY;

-- Not queried by user_id yet, but indexed up front so a future
-- "my local listings" view doesn't need a table scan.
CREATE INDEX IF NOT EXISTS idx_local_listings_user_id
  ON public.local_listings (user_id);

-- One-time migration of any rows still sitting in the old JSON file:
-- run `select * from public.local_listings;` afterwards to confirm it's empty,
-- then src/data/localListings.json can be deleted.
