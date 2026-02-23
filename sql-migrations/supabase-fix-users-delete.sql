-- Sadece users tablosu için DELETE yetkisi ekle

DROP POLICY IF EXISTS "Anyone can delete users" ON users;
CREATE POLICY "Anyone can delete users" 
  ON users FOR DELETE 
  USING (true);
