-- Run this in your Supabase SQL Editor.
-- Adds IP tracking to listing_leads so the API can rate-limit lead submissions.

ALTER TABLE public.listing_leads
  ADD COLUMN IF NOT EXISTS ip_address text;

CREATE INDEX IF NOT EXISTS idx_listing_leads_ip_created
  ON public.listing_leads (ip_address, created_at DESC);
