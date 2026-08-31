-- Run this in your Supabase SQL Editor.
-- You've already run add_local_listings_table.sql; this just adds the
-- user_id index that version was missing, so you don't need to rerun it.

CREATE INDEX IF NOT EXISTS idx_local_listings_user_id
  ON public.local_listings (user_id);
