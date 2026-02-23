# 🚀 Production Checklist

## ✅ Tamamlanan İşlemler

### 1. Test Sayfaları Kaldırıldı
- ✅ `/app/test-login/` - SİLİNDİ
- ✅ `/app/waiter/test/` - SİLİNDİ
- ✅ `/app/clear-storage/` - SİLİNDİ

### 2. Login Sayfası Temizlendi
- ✅ Test kullanıcı bilgileri kaldırıldı
- ✅ Sadece production kullanıcısı: `baran / BARANbaba123`

### 3. Console Log Temizliği
- ✅ `lib/auth.js` - Debug log'ları kaldırıldı
- ✅ `app/login/page.jsx` - Debug log'ları kaldırıldı
- ✅ `next.config.js` - Production'da otomatik console.log kaldırma eklendi

### 4. Proje Yapısı Düzenlendi
- ✅ SQL dosyaları `sql-migrations/` klasörüne taşındı
- ✅ Dokümantasyon `docs/` klasörüne taşındı
- ✅ Gereksiz summary dosyaları silindi (12 adet)
- ✅ `.gitkeep` dosyaları silindi

### 5. Production SQL Script
- ✅ `sql-migrations/production-setup.sql` oluşturuldu
- ✅ Tüm test verilerini temizler
- ✅ Owner kullanıcısı oluşturur

## 📋 Deployment Öncesi Kontrol Listesi

### Database
- [ ] Supabase projesinde `production-setup.sql` çalıştırıldı
- [ ] RLS policies aktif
- [ ] Realtime aktif (orders, service_requests)
- [ ] Backup stratejisi belirlendi

### Environment Variables
- [ ] `.env.local` production değerleri ile güncellendi
- [ ] `NEXT_PUBLIC_SUPABASE_URL` doğru
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru
- [ ] Vercel'de environment variables eklendi

### Security
- [ ] HTTPS aktif
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting düşünüldü
- [ ] Supabase RLS policies test edildi

### Performance
- [ ] Images optimize edildi
- [ ] Lighthouse score kontrol edildi (>90)
- [ ] Mobile performance test edildi
- [ ] PWA çalışıyor

### Testing
- [ ] Owner login test edildi (`baran / BARANbaba123`)
- [ ] İşletme oluşturma test edildi
- [ ] Yönetici ekleme test edildi
- [ ] Garson ekleme test edildi
- [ ] QR menü test edildi
- [ ] Sipariş akışı test edildi
- [ ] Mutfak ekranı test edildi
- [ ] Raporlar test edildi

### Monitoring
- [ ] Vercel Analytics aktif
- [ ] Supabase monitoring aktif
- [ ] Error tracking kuruldu (Sentry vb.)
- [ ] Uptime monitoring kuruldu

### Documentation
- [ ] README.md güncellendi
- [ ] API dokümantasyonu hazır
- [ ] Kullanıcı kılavuzu hazır
- [ ] Admin kılavuzu hazır

## 🔐 İlk Giriş Bilgileri

### Owner (Sistem Yöneticisi)
```
URL: https://your-domain.com/login?type=owner
Kullanıcı: baran
Şifre: BARANbaba123
```

## 📝 İlk Kurulum Adımları

### 1. Database Setup
```bash
# Supabase SQL Editor'de çalıştır
sql-migrations/production-setup.sql
```

### 2. Owner Girişi
1. `/login?type=owner` sayfasına git
2. `baran / BARANbaba123` ile giriş yap
3. `/owner` sayfasına yönlendirileceksin

### 3. İlk İşletme Oluştur
1. "Yeni İşletme Ekle" butonuna tıkla
2. İşletme bilgilerini doldur:
   - İşletme Adı
   - Slug (URL için)
   - Adres
   - Telefon
3. Kaydet

### 4. Yönetici Kullanıcısı Ekle
1. İşletme detayına git
2. "Kullanıcılar" sekmesine tıkla
3. "Yeni Kullanıcı Ekle" butonuna tıkla
4. Rol: MANAGER seç
5. Kullanıcı bilgilerini doldur
6. Kaydet

### 5. Kategoriler ve Ürünler Ekle
1. Yönetici olarak giriş yap
2. `/admin/categories` - Kategoriler ekle
3. `/admin/products` - Ürünler ekle

### 6. Masalar Oluştur
1. `/admin/tables` sayfasına git
2. Masa sayısını belirle
3. QR kodları oluştur
4. QR kodları yazdır

### 7. Garson Kullanıcıları Ekle
1. `/admin/waiters` sayfasına git
2. Garson ekle
3. PIN kodu belirle

## 🎯 Production URL'ler

### Müşteri
- QR Menü: `https://your-domain.com/[slug]/[table-id]`

### Personel
- Garson: `https://your-domain.com/waiter`
- Mutfak: `https://your-domain.com/kitchen`

### Yönetim
- Admin: `https://your-domain.com/login?type=admin`
- Owner: `https://your-domain.com/login?type=owner`

## 🔧 Bakım ve Güncelleme

### Düzenli Kontroller
- [ ] Günlük: Audit log kontrolü
- [ ] Haftalık: Database backup kontrolü
- [ ] Aylık: Performance analizi
- [ ] Aylık: Security audit

### Backup Stratejisi
1. Supabase otomatik backup (günlük)
2. Manuel backup (haftalık)
3. Export to CSV (aylık)

### Güncelleme Prosedürü
1. Staging ortamında test et
2. Backup al
3. Production'a deploy et
4. Smoke test yap
5. Monitor et

## 📞 Destek ve İletişim

### Teknik Destek
- Email: support@your-domain.com
- Telefon: +90 XXX XXX XX XX

### Acil Durum
- Database sorunları: Supabase support
- Hosting sorunları: Vercel support
- Kod sorunları: GitHub issues

## 🚨 Acil Durum Planı

### Database Çöktü
1. Supabase dashboard kontrol et
2. Son backup'ı restore et
3. RLS policies kontrol et

### Site Erişilemiyor
1. Vercel dashboard kontrol et
2. DNS ayarları kontrol et
3. SSL sertifikası kontrol et

### Performans Sorunu
1. Vercel analytics kontrol et
2. Supabase query performance kontrol et
3. Cache temizle

## ✅ Final Checklist

Deployment yapmadan önce:

- [ ] Tüm testler geçti
- [ ] Production SQL çalıştırıldı
- [ ] Environment variables ayarlandı
- [ ] Domain bağlandı
- [ ] SSL aktif
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] Dokümantasyon tamamlandı
- [ ] Ekip eğitildi

## 🎉 Go Live!

Tüm checklistler tamamlandıysa:

```bash
# Production'a deploy
git push origin main

# Vercel otomatik deploy edecek
# Deploy tamamlandığında test et
```

**Başarılar! 🚀**
