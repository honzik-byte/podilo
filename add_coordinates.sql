-- Add latitude and longitude columns to listings table
ALTER TABLE listings 
ADD COLUMN lat double precision,
ADD COLUMN lng double precision;
