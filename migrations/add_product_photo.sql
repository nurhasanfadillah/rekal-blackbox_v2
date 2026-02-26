-- Migration: Add photo_url column to products table
-- Run this SQL if you have an existing database and want to add photo support

-- Add photo_url column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update the updated_at trigger if it exists
-- This ensures the updated_at column is updated when photo_url changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_products_updated_at'
    ) THEN
        CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
