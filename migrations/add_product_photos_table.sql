-- Migration: Create product_photos table for multiple photos per product
-- This replaces the single photo_url column with a proper one-to-many relationship

-- Create product_photos table
CREATE TABLE IF NOT EXISTS product_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_photos_product_id ON product_photos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_photos_display_order ON product_photos(display_order);

-- Create updated_at trigger for product_photos
CREATE OR REPLACE FUNCTION update_product_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_photos_updated_at ON product_photos;
CREATE TRIGGER update_product_photos_updated_at
    BEFORE UPDATE ON product_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_product_photos_updated_at();

-- Migrate existing photo_url data to new table
-- This will move any existing photos from products.photo_url to product_photos
INSERT INTO product_photos (product_id, photo_url, display_order)
SELECT 
    id as product_id,
    photo_url,
    0 as display_order
FROM products 
WHERE photo_url IS NOT NULL AND photo_url != '';

-- Note: After migration, you can optionally drop the photo_url column from products table
-- ALTER TABLE products DROP COLUMN IF EXISTS photo_url;
