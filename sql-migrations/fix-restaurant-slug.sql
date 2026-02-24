-- Restaurant slug'ını kontrol et ve düzelt
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut restaurant'ları göster
SELECT id, name, slug, logo_url FROM restaurants;

-- 2. Eğer slug yanlışsa (URL içeriyorsa), düzelt
-- Örnek: slug'ı restaurant adından oluştur
UPDATE restaurants
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug LIKE '%http%' OR slug LIKE '%www%';

-- 3. Eğer logo_url slug'a karışmışsa, temizle
UPDATE restaurants
SET logo_url = NULL
WHERE logo_url LIKE '%vercel.app%';

-- 4. Kontrol et
SELECT id, name, slug, logo_url FROM restaurants;

-- 5. Manuel düzeltme (gerekirse)
-- Örnek: İlk restaurant'ın slug'ını 'my-restaurant' yap
-- UPDATE restaurants SET slug = 'my-restaurant' WHERE id = 'YOUR_RESTAURANT_ID';
