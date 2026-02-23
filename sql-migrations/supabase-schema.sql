-- QR Menü ve Garson Çağırma Sistemi - Veritabanı Şeması
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- UUID extension'ı aktifleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  qr_code_uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiters Table
CREATE TABLE IF NOT EXISTS waiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'PAID')) DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('CALL_WAITER', 'REQUEST_BILL')),
  status TEXT CHECK (status IN ('PENDING', 'COMPLETED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes (Performans için)
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_restaurant ON service_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiters_restaurant ON waiters(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Row Level Security (RLS) Politikaları

-- Restaurants Table RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;
CREATE POLICY "Public can view restaurants" 
  ON restaurants FOR SELECT 
  USING (true);

-- Tables Table RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tables" ON tables;
CREATE POLICY "Public can view tables" 
  ON tables FOR SELECT 
  USING (true);

-- Categories Table RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" 
  ON categories FOR SELECT 
  USING (true);

-- Products Table RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" 
  ON products FOR SELECT 
  USING (true);

-- Waiters Table RLS
ALTER TABLE waiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view waiters" ON waiters;
CREATE POLICY "Public can view waiters" 
  ON waiters FOR SELECT 
  USING (true);

-- Orders Table RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
CREATE POLICY "Anyone can view orders" 
  ON orders FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
CREATE POLICY "Anyone can update orders" 
  ON orders FOR UPDATE 
  USING (true);

-- Order Items Table RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
CREATE POLICY "Anyone can view order items" 
  ON order_items FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" 
  ON order_items FOR INSERT 
  WITH CHECK (true);

-- Service Requests Table RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create service requests" ON service_requests;
CREATE POLICY "Anyone can create service requests" 
  ON service_requests FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view service requests" ON service_requests;
CREATE POLICY "Anyone can view service requests" 
  ON service_requests FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can update service requests" ON service_requests;
CREATE POLICY "Anyone can update service requests" 
  ON service_requests FOR UPDATE 
  USING (true);

-- Realtime için tabloları yayınla
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Test verisi (Opsiyonel - geliştirme için)
-- Aşağıdaki INSERT komutlarını test için kullanabilirsiniz

-- Örnek Restoran
INSERT INTO restaurants (name, slug, logo_url) 
VALUES ('Lezzet Durağı', 'lezzet-duragi', 'https://via.placeholder.com/150')
ON CONFLICT (slug) DO NOTHING;

-- Örnek Masalar
INSERT INTO tables (restaurant_id, table_number) 
SELECT id, 1 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

INSERT INTO tables (restaurant_id, table_number) 
SELECT id, 2 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

INSERT INTO tables (restaurant_id, table_number) 
SELECT id, 3 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

-- Örnek Garsonlar (PIN: 1234, 5678)
INSERT INTO waiters (restaurant_id, name, pin_code, is_active)
SELECT id, 'Ahmet Yılmaz', '1234', true FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

INSERT INTO waiters (restaurant_id, name, pin_code, is_active)
SELECT id, 'Ayşe Demir', '5678', true FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

-- Örnek Kategoriler
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Ana Yemekler', 1 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'İçecekler', 2 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Tatlılar', 3 FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT DO NOTHING;

-- Örnek Ürünler (Ana Yemekler)
INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Izgara Köfte', 'Özel baharatlarla hazırlanmış ızgara köfte', 150.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Ana Yemekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Tavuk Şiş', 'Marine edilmiş tavuk göğsü şiş', 120.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Ana Yemekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Karışık Izgara', 'Köfte, tavuk, pirzola karışık', 200.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Ana Yemekler'
ON CONFLICT DO NOTHING;

-- Örnek Ürünler (İçecekler)
INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Kola', 'Soğuk kola 330ml', 25.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'İçecekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Ayran', 'Ev yapımı ayran', 15.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'İçecekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Çay', 'Demlik çay', 10.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'İçecekler'
ON CONFLICT DO NOTHING;

-- Örnek Ürünler (Tatlılar)
INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Künefe', 'Antep fıstıklı künefe', 80.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Tatlılar'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Baklava', 'Fıstıklı baklava', 70.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Tatlılar'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Sütlaç', 'Fırın sütlaç', 50.00, false
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Tatlılar'
ON CONFLICT DO NOTHING;
