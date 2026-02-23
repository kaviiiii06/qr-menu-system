-- Ödeme yöntemi kolonu ekle
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- payment_method kolonu ekle (eğer yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'CASH';
  END IF;
END $$;

-- Mevcut PAID siparişlere varsayılan ödeme yöntemi ata
UPDATE orders 
SET payment_method = 'CASH' 
WHERE status = 'PAID' AND payment_method IS NULL;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Kontrol
SELECT 
  payment_method,
  COUNT(*) as count,
  SUM(total_amount) as total
FROM orders 
WHERE status = 'PAID'
GROUP BY payment_method;
