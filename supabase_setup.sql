-- Run this in your Supabase SQL Editor to set up the database for Podilo

-- Create the Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  location text NOT NULL,
  property_type text NOT NULL,
  share_size text NOT NULL,
  price numeric NOT NULL,
  full_property_value numeric,
  occupancy text,
  description text,
  images text[] DEFAULT '{}',
  contact_email text NOT NULL,
  is_top boolean DEFAULT false,
  is_highlighted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access"
  ON public.listings FOR SELECT
  USING (true);

-- Allow anonymous insert (for MVP, anyone can post without login)
CREATE POLICY "Allow public insert"
  ON public.listings FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing_images', 'listing_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to storage
CREATE POLICY "Public Read Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing_images');

-- Allow public uploads to storage
CREATE POLICY "Public Insert Access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing_images');
