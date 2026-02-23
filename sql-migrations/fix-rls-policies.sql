-- Supabase RLS Politikalarını Düzelt
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Önce mevcut politikaları kaldır
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON orders;

-- 2. order_items için DELETE politikası
CREATE POLICY "Enable delete for order_items"
ON order_items
FOR DELETE
USING (true);  -- Herkes silebilir (geliştirme için)

-- 3. orders için DELETE politikası
CREATE POLICY "Enable delete for orders"
ON orders
FOR DELETE
USING (true);  -- Herkes silebilir (geliştirme için)

-- 4. order_items için UPDATE politikası
DROP POLICY IF EXISTS "Enable update for order_items" ON order_items;
CREATE POLICY "Enable update for order_items"
ON order_items
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. orders için UPDATE politikası
DROP POLICY IF EXISTS "Enable update for orders" ON orders;
CREATE POLICY "Enable update for orders"
ON orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 6. Kontrol: Mevcut politikaları listele
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- NOT: Production'da bu politikaları daha güvenli hale getirin!
-- Örnek güvenli politika:
-- CREATE POLICY "Enable delete for order_items by restaurant"
-- ON order_items
-- FOR DELETE
-- USING (
--   EXISTS (
--     SELECT 1 FROM orders o
--     WHERE o.id = order_items.order_id
--     AND o.restaurant_id = auth.jwt() ->> 'restaurant_id'
--   )
-- );
