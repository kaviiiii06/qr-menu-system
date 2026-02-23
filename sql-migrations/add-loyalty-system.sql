-- Müşteri Sadakat Programı
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Müşteriler tablosu
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  birth_date DATE,
  total_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, PLATINUM
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, phone)
);

-- Puan hareketleri tablosu
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- EARN, REDEEM, EXPIRE, BONUS, BIRTHDAY
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Üyelik seviyeleri tablosu
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  point_multiplier DECIMAL(3,2) DEFAULT 1.0,
  benefits TEXT,
  color TEXT DEFAULT '#gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kuponlar tablosu
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, FREE_ITEM
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri kuponları tablosu
CREATE TABLE IF NOT EXISTS customer_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_customers_restaurant_id ON customers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_type ON loyalty_points(type);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_restaurant_id ON coupons(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_coupons_customer_id ON customer_coupons(customer_id);

-- RLS Politikaları
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for customers" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for loyalty_points" ON loyalty_points FOR ALL USING (true);
CREATE POLICY "Enable all for loyalty_tiers" ON loyalty_tiers FOR ALL USING (true);
CREATE POLICY "Enable all for coupons" ON coupons FOR ALL USING (true);
CREATE POLICY "Enable all for customer_coupons" ON customer_coupons FOR ALL USING (true);

-- Varsayılan üyelik seviyeleri
INSERT INTO loyalty_tiers (restaurant_id, name, min_points, discount_percentage, point_multiplier, benefits, color)
SELECT 
  id,
  'Bronz',
  0,
  0,
  1.0,
  'Temel üyelik avantajları',
  '#CD7F32'
FROM restaurants
ON CONFLICT DO NOTHING;

INSERT INTO loyalty_tiers (restaurant_id, name, min_points, discount_percentage, point_multiplier, benefits, color)
SELECT 
  id,
  'Gümüş',
  1000,
  5,
  1.25,
  '%5 indirim, Doğum günü hediyesi',
  '#C0C0C0'
FROM restaurants
ON CONFLICT DO NOTHING;

INSERT INTO loyalty_tiers (restaurant_id, name, min_points, discount_percentage, point_multiplier, benefits, color)
SELECT 
  id,
  'Altın',
  5000,
  10,
  1.5,
  '%10 indirim, Öncelikli rezervasyon, Özel kampanyalar',
  '#FFD700'
FROM restaurants
ON CONFLICT DO NOTHING;

INSERT INTO loyalty_tiers (restaurant_id, name, min_points, discount_percentage, point_multiplier, benefits, color)
SELECT 
  id,
  'Platin',
  10000,
  15,
  2.0,
  '%15 indirim, VIP hizmet, Ücretsiz ikramlar',
  '#E5E4E2'
FROM restaurants
ON CONFLICT DO NOTHING;

-- Test kuponu
INSERT INTO coupons (restaurant_id, code, name, description, discount_type, discount_value, valid_until)
SELECT 
  id,
  'HOSGELDIN',
  'Hoş Geldin Kuponu',
  'İlk siparişinizde %10 indirim',
  'PERCENTAGE',
  10,
  NOW() + INTERVAL '30 days'
FROM restaurants
LIMIT 1
ON CONFLICT DO NOTHING;

-- Kontrol
SELECT * FROM customers LIMIT 5;
SELECT * FROM loyalty_tiers ORDER BY min_points;
SELECT * FROM coupons LIMIT 5;
