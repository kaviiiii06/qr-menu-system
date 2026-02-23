-- TÜM SİSTEMİ TEMİZLE VE YENİDEN KUR

-- 1. Tüm verileri sil (CASCADE ile ilişkili veriler de silinir)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM service_requests;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM tables;
DELETE FROM waiters;
DELETE FROM users;
DELETE FROM restaurants;

-- 2. Test Restaurant Oluştur
INSERT INTO restaurants (name, slug, logo_url) 
VALUES ('Lezzet Durağı', 'lezzet-duragi', 'https://via.placeholder.com/150')
RETURNING id;

-- 3. Kurucu Kullanıcı Oluştur
-- Username: admin, Password: admin123
INSERT INTO users (username, password_hash, full_name, role, is_active)
VALUES ('admin', 'YWRtaW4xMjNzYWx0X2tleV8yMDI0', 'Sistem Yöneticisi', 'OWNER', true);

-- 4. İşletme Yöneticisi Oluştur
-- Username: manager, Password: manager123
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'manager', 'bWFuYWdlcjEyM3NhbHRfa2V5XzIwMjQ=', 'İşletme Müdürü', 'MANAGER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi';

-- 5. Garson Oluştur
-- Username: garson1, Password: garson123
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'garson1', 'Z2Fyc29uMTIzc2FsdF9rZXlfMjAyNA==', 'Ahmet Yılmaz', 'WAITER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi';

-- 6. Test Masaları Ekle
INSERT INTO tables (restaurant_id, table_number)
SELECT id, 1 FROM restaurants WHERE slug = 'lezzet-duragi';

INSERT INTO tables (restaurant_id, table_number)
SELECT id, 2 FROM restaurants WHERE slug = 'lezzet-duragi';

INSERT INTO tables (restaurant_id, table_number)
SELECT id, 3 FROM restaurants WHERE slug = 'lezzet-duragi';

-- 7. Test Kategorileri Ekle
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Ana Yemekler', 1 FROM restaurants WHERE slug = 'lezzet-duragi';

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'İçecekler', 2 FROM restaurants WHERE slug = 'lezzet-duragi';

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Tatlılar', 3 FROM restaurants WHERE slug = 'lezzet-duragi';

-- 8. Test Ürünleri Ekle
INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Izgara Köfte', 'Özel baharatlarla hazırlanmış ızgara köfte', 150.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Ana Yemekler';

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Tavuk Şiş', 'Marine edilmiş tavuk göğsü şiş', 120.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Ana Yemekler';

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Kola', 'Soğuk kola 330ml', 25.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'İçecekler';

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Ayran', 'Ev yapımı ayran', 15.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'İçecekler';

INSERT INTO products (category_id, name, description, price, is_available)
SELECT c.id, 'Künefe', 'Antep fıstıklı künefe', 80.00, true
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'lezzet-duragi' AND c.name = 'Tatlılar';

-- 9. Kontrol Et
SELECT 'RESTAURANTS' as table_name, COUNT(*) as count FROM restaurants
UNION ALL
SELECT 'USERS', COUNT(*) FROM users
UNION ALL
SELECT 'TABLES', COUNT(*) FROM tables
UNION ALL
SELECT 'CATEGORIES', COUNT(*) FROM categories
UNION ALL
SELECT 'PRODUCTS', COUNT(*) FROM products;

-- 10. Kullanıcıları Göster
SELECT username, full_name, role, restaurant_id, is_active FROM users ORDER BY role;
