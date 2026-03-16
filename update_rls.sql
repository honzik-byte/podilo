-- Run this in your Supabase SQL Editor to enable Authentication for listings

-- 1. Add user_id column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Optional: If you want to delete existing anonymous listings, uncomment this:
-- DELETE FROM public.listings WHERE user_id IS NULL;

-- 2. Update RLS Policies
-- Drop the old policy that allowed anyone to insert
DROP POLICY IF EXISTS "Allow public insert" ON public.listings;

-- Create a new policy that requires authentication and user_id match
CREATE POLICY "Allow authenticated insert"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: We keep the public read policy so anyone can see the listings
