-- Önce mevcut test kullanıcılarını sil
DELETE FROM users WHERE username IN ('admin', 'manager', 'garson1');

-- Doğru hash'lerle yeniden ekle
-- Kurucu kullanıcı (username: admin, password: admin123)
INSERT INTO users (username, password_hash, full_name, role, is_active)
VALUES ('admin', 'YWRtaW4xMjNzYWx0X2tleV8yMDI0', 'Sistem Yöneticisi', 'OWNER', true);

-- Test işletme yöneticisi (username: manager, password: manager123)
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'manager', 'bWFuYWdlcjEyM3NhbHRfa2V5XzIwMjQ=', 'İşletme Müdürü', 'MANAGER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi';

-- Test garson (username: garson1, password: garson123)
INSERT INTO users (username, password_hash, full_name, role, restaurant_id, is_active)
SELECT 'garson1', 'Z2Fyc29uMTIzc2FsdF9rZXlfMjAyNA==', 'Ahmet Yılmaz', 'WAITER', id, true
FROM restaurants WHERE slug = 'lezzet-duragi';
