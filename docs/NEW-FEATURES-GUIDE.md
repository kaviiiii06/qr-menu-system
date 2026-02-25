# Yeni Özellikler Kılavuzu

## 🔐 Şifre Görüntüleme Özellikleri

### Owner Paneli
- **Tüm kullanıcıların şifrelerini görebilir**
- Kullanıcılar sayfasında her kullanıcının yanında göz ikonu var
- İkona tıklayarak şifreyi göster/gizle yapabilirsiniz
- Kullanıcı düzenlerken şifre değiştirebilirsiniz

### Admin Paneli
- **Garsonların şifrelerini görebilir**
- Garsonlar sayfasında her garsonun yanında göz ikonu var
- İkona tıklayarak şifreyi göster/gizle yapabilirsiniz
- Garson düzenlerken şifre değiştirebilirsiniz

## 📸 Ürün Resmi Yükleme

### Bilgisayardan Resim Yükleme
1. Admin panelinde **Ürünler** sayfasına gidin
2. **Yeni Ürün** butonuna tıklayın
3. Ürün bilgilerini doldurun
4. **"Bilgisayardan Resim Yükle"** alanına tıklayın
5. Bilgisayarınızdan resim seçin
6. Resim otomatik olarak yüklenecek

### Desteklenen Formatlar
- JPG / JPEG
- PNG
- WebP
- GIF

### Özellikler
- Maksimum dosya boyutu: 5MB
- Resim önizleme
- Yüklenen resmi kaldırma (X butonu)
- Yükleme sırasında loading göstergesi

## 🗄️ Veritabanı Değişiklikleri

### Gerekli SQL Migration

Supabase SQL Editor'de şu komutu çalıştırın:

```sql
-- Kullanıcı tablosuna düz metin şifre kolonu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

COMMENT ON COLUMN users.password IS 'Plain text password for admin viewing';
```

### Supabase Storage Kurulumu

1. Supabase Dashboard'a gidin
2. **Storage** sekmesine tıklayın
3. **New Bucket** butonuna tıklayın
4. Bucket adı: `product-images`
5. **Public bucket** seçeneğini işaretleyin
6. **Create bucket** butonuna tıklayın

### Storage Policies

Bucket oluşturduktan sonra policies ekleyin:

```sql
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

## ⚠️ Güvenlik Notları

### Şifre Saklama
- Şifreler artık hem hash'lenmiş (`password_hash`) hem de düz metin (`password`) olarak saklanıyor
- **ÖNEMLİ:** Düz metin şifre saklamak güvenlik riski oluşturur
- Bu özellik sadece küçük işletmeler ve test ortamları için önerilir
- Production ortamında kullanmadan önce güvenlik değerlendirmesi yapın

### Alternatif Çözümler
- Şifre sıfırlama sistemi
- Geçici şifreler
- 2FA (Two-Factor Authentication)

## 🚀 Deployment

### Vercel'e Deploy Etmeden Önce

1. Supabase'de storage bucket'ı oluşturun
2. SQL migration'ı çalıştırın
3. Environment variables'ları kontrol edin
4. Test edin

### Deploy Komutu

```bash
git add .
git commit -m "Add password viewing and image upload features"
git push origin main
```

Vercel otomatik olarak deploy edecek.

## 📝 Kullanım Örnekleri

### Owner - Kullanıcı Şifresi Görüntüleme
1. `/owner` paneline giriş yapın
2. İşletmeyi seçin
3. **Kullanıcılar** sekmesine gidin
4. Kullanıcı listesinde göz ikonuna tıklayın
5. Şifre görünür olacak

### Admin - Garson Şifresi Görüntüleme
1. `/admin` paneline giriş yapın
2. **Garsonlar** sekmesine gidin
3. Garson listesinde göz ikonuna tıklayın
4. Şifre görünür olacak

### Ürün Resmi Yükleme
1. `/admin/products` sayfasına gidin
2. **Yeni Ürün** butonuna tıklayın
3. Ürün bilgilerini doldurun
4. Resim yükleme alanına tıklayın
5. Dosya seçin
6. Yükleme tamamlanınca önizleme görünecek
7. **Kaydet** butonuna tıklayın

## 🐛 Sorun Giderme

### Resim Yüklenmiyor
- Supabase Storage bucket'ının oluşturulduğundan emin olun
- Bucket'ın public olduğunu kontrol edin
- Storage policies'lerin doğru ayarlandığını kontrol edin
- Dosya boyutunun 5MB'dan küçük olduğunu kontrol edin

### Şifreler Görünmüyor
- SQL migration'ın çalıştırıldığından emin olun
- Mevcut kullanıcılar için `password` kolonunun dolu olduğunu kontrol edin
- Yeni kullanıcı eklerken şifrenin kaydedildiğini kontrol edin

### Storage Hatası
```
Error: Storage bucket not found
```
Çözüm: Supabase'de `product-images` bucket'ını oluşturun.

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Supabase logs'ları kontrol edin
2. Browser console'u kontrol edin
3. Network tab'ı kontrol edin
