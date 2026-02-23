-- Kullanıcı Yönetim Sistemi için Ek Tablolar

-- Users Table (Tüm kullanıcılar için)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('OWNER', 'MANAGER', 'WAITER')) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiters tablosunu güncelle (username/password ekle)
ALTER TABLE waiters ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE waiters ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Index
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_restaurant ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view users" ON users;
CREATE POLICY "Public can view users" 
  ON users FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can create users" ON users;
CREATE POLICY "Anyone can create users" 
  ON users FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update users" ON users;
CREATE POLICY "Anyone can update users" 
  ON users FOR UPDATE 
  USING (true);

-- Kurucu kullanıcı oluştur (username: admin, password: admin123)
INSERT INTO users (username, password_hash, full_name, role, is_active)
VALUES ('admin', 'YWRtaW4xMjNzYWx0X2tleV8yMDI0', 'Sistem Yöneticisi', 'OWNER', true)
ON CONFLICT (username) DO NOTHING;

-- Test işletme yöneticisi (username: manager, password: manager123)
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'manager', 'bWFuYWdlcjEyM3NhbHRfa2V5XzIwMjQ=', 'İşletme Müdürü', 'MANAGER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT (username) DO NOTHING;

-- Test garson (username: garson1, password: garson123)
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'garson1', 'Z2Fyc29uMTIzc2FsdF9rZXlfMjAyNA==', 'Ahmet Yılmaz', 'WAITER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi'
ON CONFLICT (username) DO NOTHING;
