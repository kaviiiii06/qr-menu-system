# Deployment Rehberi

## 🚀 Vercel'e Deployment

### Adım 1: GitHub Repository Oluşturun

```bash
# Git başlat
git init

# .gitignore kontrol
# .env.local dosyasının .gitignore'da olduğundan emin olun

# İlk commit
git add .
git commit -m "Initial commit: QR Menu and Waiter Call System"

# GitHub'a push
git remote add origin https://github.com/username/qr-menu-system.git
git branch -M main
git push -u origin main
```

### Adım 2: Vercel'e Deploy

1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. **Add New Project** butonuna tıklayın
3. GitHub repository'nizi seçin
4. **Import** butonuna tıklayın

### Adım 3: Environment Variables Ekleyin

Vercel dashboard'da:

1. **Settings** > **Environment Variables** bölümüne gidin
2. Şu değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
```

3. **All** (Production, Preview, Development) seçeneğini seçin
4. **Save** butonuna tıklayın

### Adım 4: Deploy

1. **Deploy** butonuna tıklayın
2. Build tamamlanana kadar bekleyin (2-3 dakika)
3. Deployment başarılı olduğunda URL'nizi alın

### Adım 5: Domain Ayarları (Opsiyonel)

1. **Settings** > **Domains** bölümüne gidin
2. Kendi domain'inizi ekleyin
3. DNS ayarlarını yapın

## 🔧 Production Checklist

Deployment öncesi kontrol listesi:

### Supabase Ayarları

- [ ] **RLS Politikaları Aktif**
  - Supabase Dashboard > Authentication > Policies
  - Tüm tablolarda RLS aktif olmalı

- [ ] **Realtime Aktif**
  - Database > Replication
  - `service_requests` tablosu enabled olmalı

- [ ] **API Keys Doğru**
  - Project Settings > API
  - Anon/Public key kullanılıyor olmalı (Service Role değil!)

### Uygulama Ayarları

- [ ] **Environment Variables**
  - Vercel'de doğru ayarlandı mı?
  - Production, Preview, Development için set edildi mi?

- [ ] **Test Verisi Temizlendi**
  - Production için test verilerini silin:
  ```sql
  DELETE FROM service_requests;
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM tables;
  DELETE FROM restaurants;
  ```

- [ ] **Error Handling**
  - Error sayfaları test edildi mi?
  - 404 sayfası çalışıyor mu?

### Güvenlik

- [ ] **HTTPS Aktif**
  - Vercel otomatik HTTPS sağlar

- [ ] **CORS Ayarları**
  - Supabase otomatik handle eder

- [ ] **Rate Limiting**
  - Supabase'de rate limiting aktif

## 📱 QR Kod Oluşturma

### Her Masa İçin QR Kod

1. Supabase'den masa ID'lerini alın:
```sql
SELECT id, table_number FROM tables ORDER BY table_number;
```

2. Her masa için URL oluşturun:
```
https://your-domain.vercel.app/lezzet-duragi/[MASA-ID]
```

3. QR kod oluşturun:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QR Code Monkey](https://www.qrcode-monkey.com/)

4. QR kodları yazdırın ve masalara yerleştirin

### QR Kod Tasarım Önerileri

- Logo ekleyin (restoran logosu)
- Masa numarasını QR kodun altına yazın
- Lamine edin (dayanıklılık için)
- A6 veya A7 boyutunda yazdırın

## 🔄 Güncelleme ve Bakım

### Kod Güncellemeleri

```bash
# Değişiklikleri commit edin
git add .
git commit -m "Update: feature description"
git push

# Vercel otomatik deploy eder
```

### Veritabanı Güncellemeleri

Supabase SQL Editor'de migration'ları çalıştırın:

```sql
-- Örnek: Yeni sütun ekleme
ALTER TABLE products ADD COLUMN allergens TEXT;

-- Örnek: Yeni kategori ekleme
INSERT INTO categories (restaurant_id, name, sort_order)
VALUES ('restaurant-uuid', 'Yeni Kategori', 4);
```

### Monitoring

1. **Vercel Analytics**
   - Dashboard > Analytics
   - Sayfa görüntülemeleri, performans

2. **Supabase Logs**
   - Dashboard > Logs
   - Database queries, errors

3. **Error Tracking**
   - Vercel > Deployments > Logs
   - Runtime errors

## 🌍 Çoklu Restoran Desteği

### Yeni Restoran Ekleme

1. Supabase'de yeni restoran oluşturun:
```sql
INSERT INTO restaurants (name, slug, logo_url)
VALUES ('Yeni Restoran', 'yeni-restoran', 'https://logo-url.com');
```

2. Masalar ekleyin:
```sql
INSERT INTO tables (restaurant_id, table_number)
SELECT id, 1 FROM restaurants WHERE slug = 'yeni-restoran';
-- Diğer masalar için tekrarlayın
```

3. Kategoriler ve ürünler ekleyin

4. QR kodlar oluşturun:
```
https://your-domain.vercel.app/yeni-restoran/[MASA-ID]
```

## 🔐 Güvenlik Best Practices

### Supabase

- ✅ RLS her zaman aktif
- ✅ Service Role key'i asla client'ta kullanmayın
- ✅ Anon key sadece public işlemler için

### Vercel

- ✅ Environment variables'ı güvenli saklayın
- ✅ Preview deployments için ayrı Supabase projesi kullanın
- ✅ Production branch'i koruyun (branch protection)

### Genel

- ✅ HTTPS kullanın (Vercel otomatik)
- ✅ Regular backups (Supabase otomatik)
- ✅ Monitoring ve alerting aktif

## 📊 Performans Optimizasyonu

### Next.js

- ✅ Server Components kullanıldı
- ✅ Image optimization aktif
- ✅ Code splitting otomatik

### Supabase

- ✅ Indexes eklendi
- ✅ Connection pooling aktif
- ✅ Realtime filters kullanıldı

### Monitoring

Vercel Analytics'te kontrol edin:
- Core Web Vitals
- Page load times
- API response times

## 🆘 Sorun Giderme

### Deployment Başarısız

**Hata:** Build failed

**Çözüm:**
1. Local'de build test edin: `npm run build`
2. Dependencies güncel mi kontrol edin
3. Vercel logs'ları inceleyin

### Realtime Çalışmıyor

**Hata:** Yeni talepler görünmüyor

**Çözüm:**
1. Supabase > Database > Replication kontrol edin
2. `service_requests` enabled mi?
3. Browser console'da hata var mı?

### Environment Variables Hatası

**Hata:** Supabase connection failed

**Çözüm:**
1. Vercel > Settings > Environment Variables
2. Değerler doğru mu?
3. Redeploy yapın

## 📞 Destek

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

## ✅ Post-Deployment Checklist

- [ ] Ana sayfa açılıyor
- [ ] Müşteri menü sayfası çalışıyor
- [ ] Garson dashboard çalışıyor
- [ ] Realtime bildirimler çalışıyor
- [ ] Mobil cihazlarda test edildi
- [ ] QR kodlar oluşturuldu
- [ ] Masalara yerleştirildi
- [ ] Garsonlar eğitildi
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
