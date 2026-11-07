-- Tambahkan kolom biaya CMT ke tabel products
-- CMT = Cut, Make & Trim — biaya produksi flat per unit
-- Dijumlahkan ke total material sebelum overhead dihitung

ALTER TABLE products
ADD COLUMN IF NOT EXISTS cmt_cost DECIMAL(12, 2) NOT NULL DEFAULT 0;
