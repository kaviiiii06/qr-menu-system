-- =====================================================
-- PRODUCTION SETUP - LIVE MODE
-- =====================================================
-- Bu script production ortamı için hazırlanmıştır
-- Tüm test verilerini temizler ve sadece owner kullanıcısı oluşturur
-- =====================================================

-- 1. TÜM TEST VERİLERİNİ TEMİZLE
-- =====================================================

-- Önce bağımlı tabloları temizle (sadece mevcut olanlar)
DELETE FROM order_items WHERE true;
DELETE FROM orders WHERE true;
DELETE FROM service_requests WHERE true;
DELETE FROM audit_logs WHERE true;

-- Opsiyonel tablolar (varsa temizle, yoksa hata verme)
DO $$ 
BEGIN
  -- Stock movements
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
    DELETE FROM stock_movements;
  END IF;
  
  -- Reservations
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservations') THEN
    DELETE FROM reservations;
  END IF;
  
  -- Loyalty transactions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loyalty_transactions') THEN
    DELETE FROM loyalty_transactions;
  END IF;
  
  -- Loyalty cards
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loyalty_cards') THEN
    DELETE FROM loyalty_cards;
  END IF;
END $$;

-- Ana tabloları temizle
DELETE FROM products WHERE true;
DELETE FROM categories WHERE true;
DELETE FROM tables WHERE true;
DELETE FROM waiters WHERE true;
DELETE FROM users WHERE true;
DELETE FROM restaurants WHERE true;

-- 2. OWNER KULLANICISI OLUŞTUR
-- =====================================================
-- Kullanıcı: baran
-- Şifre: BARANbaba123
-- Rol: OWNER (Sistem Yöneticisi)

-- Önce mevcut baran kullanıcısını sil (varsa)
DELETE FROM users WHERE username = 'baran';

-- Yeni owner kullanıcısı oluştur
INSERT INTO users (
  id,
  username,
  password_hash,
  full_name,
  role,
  restaurant_id,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'baran',
  'QkFSQU5iYWJhMTIzc2FsdF9rZXlfMjAyNA==', -- BARANbaba123 (base64 encoded)
  'Baran - Sistem Yöneticisi',
  'OWNER',
  NULL, -- Owner'ın restaurant_id'si yok
  true,
  NOW()
);

-- 3. SEQUENCE'LERİ SIFIRLA
-- =====================================================

-- Eğer sequence kullanıyorsanız sıfırlayın
-- ALTER SEQUENCE restaurants_id_seq RESTART WITH 1;
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- 4. DOĞRULAMA
-- =====================================================

-- Owner kullanıcısını kontrol et
SELECT 
  id,
  username,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE username = 'baran';

-- Tüm tabloların temiz olduğunu doğrula (sadece mevcut tablolar)
SELECT 
  'restaurants' as table_name, COUNT(*) as count FROM restaurants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'tables', COUNT(*) FROM tables
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'waiters', COUNT(*) FROM waiters
UNION ALL
SELECT 'service_requests', COUNT(*) FROM service_requests
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- =====================================================
-- NOTLAR
-- =====================================================
-- 
-- 1. İlk Giriş:
--    - URL: /login?type=owner
--    - Kullanıcı: baran
--    - Şifre: BARANbaba123
--
-- 2. İlk Adımlar:
--    a) /owner sayfasından yeni işletme oluştur
--    b) İşletme için yönetici kullanıcısı ekle
--    c) Kategoriler ve ürünler ekle
--    d) Masalar oluştur
--    e) Garson kullanıcıları ekle
--
-- 3. Güvenlik:
--    - Production'da RLS policies aktif olmalı
--    - Environment variables doğru ayarlanmalı
--    - HTTPS kullanılmalı
--    - Regular backup alınmalı
--
-- 4. Test Sayfaları:
--    - /test-login - SİLİNDİ
--    - /waiter/test - SİLİNDİ
--    - /clear-storage - SİLİNDİ
--
-- 5. Monitoring:
--    - /admin/logs - Audit log takibi
--    - Supabase Dashboard - Database monitoring
--    - Vercel Analytics - Performance monitoring
--
-- =====================================================

-- ŞİFRE HASH HESAPLAMA (JavaScript)
-- =====================================================
-- 
-- lib/auth.js içindeki hashPassword fonksiyonu:
-- 
-- export function hashPassword(password) {
--   return btoa(password + 'salt_key_2024')
-- }
--
-- Yeni kullanıcı eklerken:
-- 1. Node.js console'da çalıştır:
--    Buffer.from('YENİŞİFRE' + 'salt_key_2024').toString('base64')
-- 2. Çıkan hash'i password_hash kolonuna yaz
--
-- =====================================================
