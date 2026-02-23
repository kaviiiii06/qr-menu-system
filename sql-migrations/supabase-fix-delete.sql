-- Kullanıcıları silme yetkisi ekle

-- Users tablosu için DELETE policy
DROP POLICY IF EXISTS "Anyone can delete users" ON users;
CREATE POLICY "Anyone can delete users" 
  ON users FOR DELETE 
  USING (true);

-- Waiters tablosu için DELETE policy (eski garson tablosu)
DROP POLICY IF EXISTS "Anyone can delete waiters" ON waiters;
CREATE POLICY "Anyone can delete waiters" 
  ON waiters FOR DELETE 
  USING (true);

-- Diğer tablolar için de DELETE policy ekle
DROP POLICY IF EXISTS "Anyone can delete restaurants" ON restaurants;
CREATE POLICY "Anyone can delete restaurants" 
  ON restaurants FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete tables" ON tables;
CREATE POLICY "Anyone can delete tables" 
  ON tables FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;
CREATE POLICY "Anyone can delete categories" 
  ON categories FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON products;
CREATE POLICY "Anyone can delete products" 
  ON products FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;
CREATE POLICY "Anyone can delete orders" 
  ON orders FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete order_items" ON order_items;
CREATE POLICY "Anyone can delete order_items" 
  ON order_items FOR DELETE 
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete service_requests" ON service_requests;
CREATE POLICY "Anyone can delete service_requests" 
  ON service_requests FOR DELETE 
  USING (true);
