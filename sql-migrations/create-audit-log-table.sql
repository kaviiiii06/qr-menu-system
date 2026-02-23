-- Audit Log Tablosu Oluştur
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Audit Log tablosu
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  entity_type TEXT NOT NULL, -- 'ORDER', 'ORDER_ITEM', 'TABLE', 'PRODUCT', 'CATEGORY', 'USER'
  entity_id UUID,
  entity_name TEXT,
  details JSONB, -- Detaylı bilgi
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant ON audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- RLS Politikaları
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Enable read for audit_logs"
ON audit_logs
FOR SELECT
USING (true);

-- Herkes yazabilir (sistem logları için)
CREATE POLICY "Enable insert for audit_logs"
ON audit_logs
FOR INSERT
WITH CHECK (true);

-- Örnek log kayıtları
COMMENT ON TABLE audit_logs IS 'Tüm sistem aktivitelerini kaydeder';
COMMENT ON COLUMN audit_logs.action IS 'CREATE, UPDATE, DELETE';
COMMENT ON COLUMN audit_logs.entity_type IS 'ORDER, ORDER_ITEM, TABLE, PRODUCT, CATEGORY, USER';
COMMENT ON COLUMN audit_logs.details IS 'JSON formatında detaylı bilgi';
