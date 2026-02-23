# Test Rehberi - QR Menü ve Garson Çağırma Sistemi

## 🚀 Başlangıç

### 1. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Project Settings > API bölümünden bilgileri alın:
   - Project URL
   - Anon/Public Key

### 2. Environment Variables

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your-actual-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 3. Veritabanı Şemasını Oluşturun

1. Supabase Dashboard > SQL Editor'ü açın
2. `supabase-schema.sql` dosyasının tüm içeriğini kopyalayın
3. SQL Editor'e yapıştırın ve "RUN" butonuna tıklayın
4. Başarılı mesajı görmelisiniz

**Not:** SQL dosyası otomatik olarak test verisi de ekler:
- 1 restoran (Lezzet Durağı)
- 3 masa
- 3 kategori (Ana Yemekler, İçecekler, Tatlılar)
- 9 ürün

### 4. Masa ID'sini Alın

Supabase Dashboard'da:
1. Table Editor > `tables` tablosuna gidin
2. Herhangi bir masa kaydının `id` değerini kopyalayın (UUID formatında)

## 🧪 Test Senaryoları

### Test 1: Ana Sayfa

```bash
npm run dev
```

Tarayıcıda: `http://localhost:3000`

**Beklenen:**
- "QR Menü ve Garson Çağırma Sistemi" başlığı
- Turuncu renk teması (#ea580c)
- Açık gri arka plan (#f3f4f6)

---

### Test 2: Müşteri Menü Sayfası

URL: `http://localhost:3000/lezzet-duragi/[MASA-ID]`

**[MASA-ID]** yerine Supabase'den aldığınız UUID'yi yapıştırın.

**Beklenen:**
✅ Restoran logosu veya ikon
✅ "Lezzet Durağı" başlığı
✅ Masa numarası badge'i
✅ 3 kategori tab'ı (Ana Yemekler, İçecekler, Tatlılar)
✅ Ürün kartları (görsel, isim, açıklama, fiyat)
✅ "Sütlaç" ürününde "Stokta Yok" etiketi
✅ Sağ alt köşede turuncu "Garson Çağır" butonu (pulse animasyonlu)

**Test Adımları:**
1. Kategoriler arasında geçiş yapın → Ürünler filtrelenmeli
2. Scroll yapın → Header sticky kalmalı
3. "Garson Çağır" butonuna tıklayın → Modal açılmalı
4. "Garson Çağır" seçeneğine tıklayın → "Talebiniz alındı" toast mesajı
5. "Hesap İste" seçeneğini deneyin → Başarı mesajı

---

### Test 3: Garson Dashboard

URL: `http://localhost:3000/admin/dashboard`

**Beklenen:**
✅ "Garson Paneli" başlığı
✅ Yeşil nokta (Realtime bağlantı göstergesi)
✅ "0 bekleyen talep" (başlangıçta)
✅ Yenile butonu
✅ "Bekleyen Talep Yok" boş state

---

### Test 4: Gerçek Zamanlı Akış (En Önemli Test!)

**Hazırlık:**
1. İki tarayıcı penceresi açın:
   - Pencere 1: Müşteri menü sayfası (`/lezzet-duragi/[MASA-ID]`)
   - Pencere 2: Garson dashboard (`/admin/dashboard`)

**Test Adımları:**

#### Adım 1: Garson Çağırma
1. **Pencere 1** (Müşteri): "Garson Çağır" butonuna tıklayın
2. "Garson Çağır" seçeneğini seçin
3. **Beklenen:**
   - ✅ Müşteri ekranında: "Talebiniz alındı" toast mesajı
   - ✅ **Pencere 2** (Dashboard): 
     - Sayfa yenilenmeden yeni talep kartı belirir
     - 🔊 Beep sesi çalar
     - Toast bildirimi: "Yeni talep: Masa X - Garson Çağırma"
     - Browser notification (izin verildiyse)

#### Adım 2: Hesap İsteme
1. **Pencere 1** (Müşteri): "Garson Çağır" butonuna tekrar tıklayın
2. "Hesap İste" seçeneğini seçin
3. **Beklenen:**
   - ✅ Dashboard'da ikinci talep kartı belirir
   - ✅ Ses ve bildirimler tekrar çalışır

#### Adım 3: Talep Tamamlama
1. **Pencere 2** (Dashboard): Bir talep kartında "Tamamlandı" butonuna tıklayın
2. **Beklenen:**
   - ✅ Talep kartı anında listeden kaybolur
   - ✅ "X bekleyen talep" sayısı güncellenir

---

### Test 5: Hata Durumları

#### Geçersiz Restoran Slug
URL: `http://localhost:3000/olmayan-restoran/[MASA-ID]`

**Beklenen:**
✅ 404 sayfası
✅ "Sayfa Bulunamadı" mesajı
✅ "Ana Sayfaya Dön" butonu

#### Geçersiz Masa ID
URL: `http://localhost:3000/lezzet-duragi/00000000-0000-0000-0000-000000000000`

**Beklenen:**
✅ 404 sayfası

---

### Test 6: Mobil Uyumluluk

**Chrome DevTools:**
1. F12 tuşuna basın
2. Device Toolbar'ı açın (Ctrl+Shift+M)
3. iPhone 12 Pro seçin

**Test Edilecekler:**
✅ Menü sayfası mobil görünümde düzgün
✅ Kategoriler yatay scroll edilebilir
✅ Ürün kartları tek sütunda
✅ "Garson Çağır" butonu dokunmatik kullanıma uygun (44x44px minimum)
✅ Modal tam ekran açılır
✅ Butonlar büyük ve tıklanabilir

---

### Test 7: Performans

**Kontrol Edilecekler:**
✅ Sayfa yükleme hızı (< 2 saniye)
✅ Realtime bağlantı kurulması (yeşil nokta)
✅ Talep oluşturma hızı (< 1 saniye)
✅ Dashboard güncelleme hızı (anında)

---

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun 1: Realtime Çalışmıyor

**Çözüm:**
1. Supabase Dashboard > Database > Replication
2. `service_requests` tablosunu "Enable" edin
3. Veya SQL Editor'de çalıştırın:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
```

### Sorun 2: "Supabase URL ve Anon Key eksik" Hatası

**Çözüm:**
1. `.env.local` dosyasını kontrol edin
2. Değerlerin doğru olduğundan emin olun
3. Development server'ı yeniden başlatın (`npm run dev`)

### Sorun 3: Ürünler Görünmüyor

**Çözüm:**
1. Supabase Dashboard > Table Editor > `products`
2. Ürünlerin `category_id` değerlerinin doğru olduğunu kontrol edin
3. SQL şemasını tekrar çalıştırın

### Sorun 4: Browser Notification Çalışmıyor

**Çözüm:**
1. Tarayıcı ayarlarından bildirim izni verin
2. HTTPS veya localhost'ta çalıştığınızdan emin olun
3. Bazı tarayıcılar (Safari) farklı davranabilir

---

## ✅ Test Checklist

### Müşteri Menü Sayfası
- [ ] Restoran bilgileri görünüyor
- [ ] Masa numarası doğru
- [ ] Kategoriler listeleniyor
- [ ] Kategori geçişi çalışıyor
- [ ] Ürünler görünüyor
- [ ] Fiyatlar TL formatında
- [ ] Stokta olmayan ürün işaretli
- [ ] Floating button görünüyor
- [ ] Modal açılıyor
- [ ] Garson çağırma çalışıyor
- [ ] Hesap isteme çalışıyor
- [ ] Toast mesajları görünüyor

### Garson Dashboard
- [ ] Talepler listeleniyor
- [ ] Realtime bağlantı aktif (yeşil nokta)
- [ ] Yeni talep anında görünüyor
- [ ] Ses bildirimi çalışıyor
- [ ] Toast bildirimi görünüyor
- [ ] Browser notification çalışıyor
- [ ] Tamamla butonu çalışıyor
- [ ] Talep listeden kalkıyor
- [ ] Boş state görünüyor
- [ ] Yenile butonu çalışıyor

### Genel
- [ ] Mobil uyumlu
- [ ] Hızlı yükleniyor
- [ ] Hata sayfaları çalışıyor
- [ ] Renk teması doğru
- [ ] Animasyonlar akıcı

---

## 📱 QR Kod Testi (Opsiyonel)

1. [QR Code Generator](https://www.qr-code-generator.com/) kullanın
2. URL: `http://localhost:3000/lezzet-duragi/[MASA-ID]`
3. QR kodu yazdırın veya ekranda gösterin
4. Mobil cihazınızla tarayın
5. Menü sayfası açılmalı

**Not:** Localhost mobil cihazdan erişilemez. Test için:
- Bilgisayarınızın IP adresini kullanın: `http://192.168.1.X:3000/...`
- Veya ngrok gibi tunnel servisi kullanın

---

## 🎉 Başarılı Test Sonucu

Tüm testler başarılıysa:
✅ MVP hazır!
✅ Production'a deploy edilebilir
✅ Gerçek restoranlarda kullanılabilir

## 📞 Destek

Sorun yaşarsanız:
1. Console'u kontrol edin (F12 > Console)
2. Supabase logs'ları kontrol edin
3. README.md dosyasına bakın
