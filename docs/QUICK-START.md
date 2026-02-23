# ⚡ Hızlı Başlangıç Rehberi

5 dakikada sistemi çalıştırın!

## 📋 Ön Hazırlık

- ✅ Node.js 18+ yüklü
- ✅ Supabase hesabı
- ✅ Git yüklü

## 🚀 Adım Adım Kurulum

### 1️⃣ Projeyi İndirin (1 dk)

```bash
git clone <repository-url>
cd qr-menu-waiter-system
npm install
```

### 2️⃣ Supabase Kurulumu (2 dk)

1. [supabase.com](https://supabase.com) → Yeni proje oluştur
2. Project Settings → API → Bilgileri kopyala
3. `.env.local` oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 3️⃣ Veritabanı Kurulumu (2 dk)

Supabase SQL Editor'de sırayla çalıştır:

```sql
-- 1. Ana şema (ZORUNLU)
-- supabase-schema.sql dosyasını kopyala-yapıştır

-- 2. Auth sistemi (ZORUNLU)
-- supabase-auth-schema.sql dosyasını kopyala-yapıştır

-- 3. Audit log (OPSİYONEL)
-- create-audit-log-table.sql

-- 4. Ödeme yöntemi (OPSİYONEL)
-- add-payment-method.sql

-- 5. Stok yönetimi (OPSİYONEL)
-- add-stock-management.sql
```

### 4️⃣ Realtime Aktifleştir

SQL Editor'de:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 5️⃣ Başlat! 🎉

```bash
npm run dev
```

Tarayıcıda: [http://localhost:3000](http://localhost:3000)

---

## 🎯 İlk Giriş

### Test Kullanıcıları

| Rol | Kullanıcı Adı | Şifre | URL |
|-----|---------------|-------|-----|
| Owner | admin | admin123 | /owner |
| Manager | manager | manager123 | /admin |
| Garson | garson1 | garson123 | /waiter/orders |

### İlk Adımlar

1. **Owner olarak giriş yap** (`/owner`)
   - İşletme bilgilerini kontrol et

2. **Admin olarak giriş yap** (`/admin`)
   - Kategorileri kontrol et
   - Ürünleri kontrol et
   - Masaları kontrol et

3. **Garson olarak giriş yap** (`/waiter/orders`)
   - Sipariş oluştur
   - Test et

4. **Mutfak ekranını aç** (`/kitchen`)
   - Siparişleri gör
   - Durum değiştir

5. **Müşteri menüsünü test et**
   - Masa ID'si al (Supabase → tables tablosu)
   - URL: `/lezzet-duragi/[masa-id]`
   - Garson çağır

---

## ✅ Kontrol Listesi

Kurulum tamamlandı mı?

- [ ] npm install başarılı
- [ ] .env.local oluşturuldu
- [ ] Supabase şemaları çalıştırıldı
- [ ] Realtime aktif
- [ ] npm run dev çalışıyor
- [ ] Owner girişi yapıldı
- [ ] Admin girişi yapıldı
- [ ] Garson girişi yapıldı
- [ ] Mutfak ekranı açıldı
- [ ] Müşteri menüsü test edildi

---

## 🐛 Sorun mu Var?

### Supabase Bağlantı Hatası
```bash
# .env.local dosyasını kontrol et
# URL ve KEY doğru mu?
cat .env.local
```

### Realtime Çalışmıyor
```sql
-- Supabase SQL Editor'de çalıştır
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### Giriş Yapamıyorum
```sql
-- Kullanıcıları kontrol et
SELECT * FROM users;

-- Yoksa auth scriptini tekrar çalıştır
-- supabase-auth-schema.sql
```

### Port Kullanımda
```bash
# Farklı port kullan
npm run dev -- -p 3001
```

---

## 📚 Sonraki Adımlar

Kurulum tamamlandı! Şimdi:

1. **Özelleştir**
   - Restoran bilgilerini güncelle
   - Kategorileri düzenle
   - Ürünleri ekle
   - Masaları ayarla

2. **Test Et**
   - Tüm özellikleri dene
   - Mobilde test et
   - Farklı tarayıcılarda test et

3. **Deploy Et**
   - Vercel'e deploy et
   - QR kodları oluştur
   - Canlıya al!

---

## 🎓 Öğren

- 📖 [README.md](README.md) - Detaylı dokümantasyon
- 🧪 [TEST-GUIDE.md](TEST-GUIDE.md) - Test senaryoları
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy rehberi
- 📊 [FINAL-SUMMARY.md](FINAL-SUMMARY.md) - Tüm özellikler

---

## 💡 İpuçları

### Hızlı Test
```bash
# 1. Mutfak ekranını aç (Tab 1)
http://localhost:3000/kitchen

# 2. Garson panelini aç (Tab 2)
http://localhost:3000/waiter/orders

# 3. Sipariş oluştur
# 4. Mutfak ekranında görün!
```

### QR Kod Oluştur
```javascript
// Masa URL'si
const url = `https://your-domain.com/lezzet-duragi/${tableId}`

// QR kod oluştur (qrcode.js kullan)
// Yazdır ve masaya koy!
```

### PWA Test
```bash
# 1. Production build
npm run build
npm start

# 2. Chrome DevTools
# Application → Manifest
# Application → Service Workers

# 3. "Add to Home Screen" test et
```

---

## 🎉 Başarılar!

Sistem hazır! Artık:
- ✅ Müşteriler QR kod ile menüye erişebilir
- ✅ Garsonlar sipariş alabilir
- ✅ Mutfak siparişleri görebilir
- ✅ Yönetim raporları görebilir
- ✅ Kasa takibi yapabilir
- ✅ Stok yönetimi yapabilir

**Sorularınız için:** GitHub Issues

**İyi çalışmalar!** 🚀
