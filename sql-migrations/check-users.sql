-- Mevcut kullanıcıları kontrol et
SELECT id, username, full_name, role, restaurant_id, is_active 
FROM users 
ORDER BY created_at DESC;

-- Restoran ID'lerini kontrol et
SELECT id, name, slug 
FROM restaurants 
ORDER BY created_at DESC;
