-- Rezervasyon Sistemi
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Rezervasyon tablosu
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  guest_count INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  status TEXT DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(customer_phone);

-- RLS Politikaları
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for reservations"
ON reservations
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for reservations"
ON reservations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for reservations"
ON reservations
FOR UPDATE
USING (true);

-- Rezervasyon ayarları tablosu
CREATE TABLE IF NOT EXISTS reservation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  min_advance_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 30,
  default_duration_minutes INTEGER DEFAULT 120,
  allow_online_booking BOOLEAN DEFAULT true,
  require_confirmation BOOLEAN DEFAULT true,
  send_sms_confirmation BOOLEAN DEFAULT false,
  send_email_confirmation BOOLEAN DEFAULT true,
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '23:00',
  slot_interval_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE reservation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for reservation_settings"
ON reservation_settings
FOR ALL
USING (true);

-- Test verisi
INSERT INTO reservation_settings (restaurant_id)
SELECT id FROM restaurants LIMIT 1
ON CONFLICT (restaurant_id) DO NOTHING;

-- Kontrol
SELECT * FROM reservations LIMIT 5;
SELECT * FROM reservation_settings LIMIT 1;
