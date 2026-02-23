-- Orders tablosundaki waiter_id referansını users tablosuna güncelle

-- Önce mevcut foreign key constraint'i kaldır
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_waiter_id_fkey;

-- Yeni foreign key constraint ekle (users tablosuna)
ALTER TABLE orders 
ADD CONSTRAINT orders_waiter_id_fkey 
FOREIGN KEY (waiter_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- Kontrol için
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='orders'
  AND kcu.column_name='waiter_id';
