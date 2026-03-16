-- 1. Přidání sloupce pro telefonní číslo do tabulky listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS contact_phone text;
