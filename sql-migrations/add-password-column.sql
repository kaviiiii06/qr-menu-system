-- Kullanıcı tablosuna düz metin şifre kolonu ekle
-- NOT: Bu güvenlik riski oluşturur, sadece geliştirme/test ortamları için önerilir

ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Mevcut kullanıcılar için varsayılan şifre (isteğe bağlı)
-- UPDATE users SET password = 'changeme123' WHERE password IS NULL;

COMMENT ON COLUMN users.password IS 'Plain text password for admin viewing (NOT RECOMMENDED for production)';
