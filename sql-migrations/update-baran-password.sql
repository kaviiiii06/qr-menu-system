-- =====================================================
-- BARAN KULLANICISI ŞİFRE GÜNCELLEMESİ
-- =====================================================
-- Bu script sadece baran kullanıcısının şifresini günceller
-- Eğer kullanıcı yoksa oluşturur
-- =====================================================

-- Önce kontrol et, varsa güncelle, yoksa oluştur
DO $$ 
BEGIN
  -- Baran kullanıcısı var mı kontrol et
  IF EXISTS (SELECT 1 FROM users WHERE username = 'baran') THEN
    -- Varsa sadece şifreyi güncelle
    UPDATE users 
    SET 
      password_hash = 'QkFSQU5iYWJhMTIzc2FsdF9rZXlfMjAyNA==',
      full_name = 'Baran - Sistem Yöneticisi',
      role = 'OWNER',
      restaurant_id = NULL,
      is_active = true,
      updated_at = NOW()
    WHERE username = 'baran';
    
    RAISE NOTICE 'Baran kullanıcısı güncellendi';
  ELSE
    -- Yoksa yeni oluştur
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
      'QkFSQU5iYWJhMTIzc2FsdF9rZXlfMjAyNA==',
      'Baran - Sistem Yöneticisi',
      'OWNER',
      NULL,
      true,
      NOW()
    );
    
    RAISE NOTICE 'Baran kullanıcısı oluşturuldu';
  END IF;
END $$;

-- Kontrol et
SELECT 
  id,
  username,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE username = 'baran';

-- =====================================================
-- SONUÇ
-- =====================================================
-- 
-- Kullanıcı Adı: baran
-- Şifre: BARANbaba123
-- Rol: OWNER
-- 
-- Giriş URL: /login?type=owner
-- 
-- =====================================================
