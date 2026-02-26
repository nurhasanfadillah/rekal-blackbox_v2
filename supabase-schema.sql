-- Supabase Database Schema for ReKal App
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  standard_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'Pcs',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  overhead_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20,
  target_margin_percentage DECIMAL(5, 2) NOT NULL DEFAULT 30,
  total_material_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  production_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  estimated_selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  gross_profit_per_unit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill of Materials Table
CREATE TABLE IF NOT EXISTS bill_of_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_category_id ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_bom_product_id ON bill_of_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_material_id ON bill_of_materials(material_id);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for updates)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON materials;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON bill_of_materials;

-- Create policies for all users (anon and authenticated)
CREATE POLICY "Enable all access for all users" ON categories
  FOR ALL USING (true);

CREATE POLICY "Enable all access for all users" ON materials
  FOR ALL USING (true);

CREATE POLICY "Enable all access for all users" ON products
  FOR ALL USING (true);

CREATE POLICY "Enable all access for all users" ON bill_of_materials
  FOR ALL USING (true);

-- Create storage bucket for product images (optional)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policy if exists
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON storage.objects;

-- Storage policy for all users
CREATE POLICY "Enable all access for all users" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images');
