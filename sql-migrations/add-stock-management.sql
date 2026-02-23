-- Stok yönetimi kolonları ekle
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- products tablosuna stok kolonları ekle
DO $$ 
BEGIN
  -- stock_quantity kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;

  -- stock_enabled kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_enabled'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_enabled BOOLEAN DEFAULT false;
  END IF;

  -- low_stock_threshold kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
  END IF;
END $$;

-- Stok hareketleri tablosu oluştur
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL, -- 'IN' (giriş), 'OUT' (çıkış), 'ADJUSTMENT' (düzeltme)
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_restaurant_id ON stock_movements(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- RLS Politikaları
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for stock_movements"
ON stock_movements
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for stock_movements"
ON stock_movements
FOR INSERT
WITH CHECK (true);

-- Kontrol
SELECT 
  p.name,
  p.stock_enabled,
  p.stock_quantity,
  p.low_stock_threshold
FROM products p
LIMIT 5;
