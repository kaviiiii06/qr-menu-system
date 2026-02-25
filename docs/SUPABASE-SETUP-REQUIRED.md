# ⚠️ SUPABASE AYARLARI GEREKLİ

Yeni özelliklerin çalışması için Supabase'de bazı ayarlar yapmanız gerekiyor.

## 1️⃣ SQL Migration Çalıştır

### Adımlar:
1. https://supabase.com adresine git
2. Projenizi seçin
3. Sol menüden **SQL Editor** sekmesine tıklayın
4. **New Query** butonuna tıklayın
5. Aşağıdaki SQL kodunu yapıştırın:

```sql
-- Kullanıcı tablosuna düz metin şifre kolonu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

COMMENT ON COLUMN users.password IS 'Plain text password for admin viewing';

-- Mevcut kullanıcılar için şifreleri güncelle (opsiyonel)
-- Eğer mevcut kullanıcıların şifrelerini biliyorsanız manuel olarak güncelleyin
-- Örnek: UPDATE users SET password = 'gerçek_şifre' WHERE username = 'baran';
```

6. **Run** butonuna tıklayın
7. "Success" mesajını görmelisiniz

---

## 2️⃣ Storage Bucket Oluştur

### Adımlar:
1. Supabase Dashboard'da sol menüden **Storage** sekmesine tıklayın
2. **New Bucket** butonuna tıklayın
3. Şu bilgileri girin:
   - **Name:** `product-images`
   - **Public bucket:** ✅ İşaretleyin (önemli!)
4. **Create bucket** butonuna tıklayın

---

## 3️⃣ Storage Policies Ekle

### Adımlar:
1. Oluşturduğunuz `product-images` bucket'ına tıklayın
2. **Policies** sekmesine gidin
3. **New Policy** butonuna tıklayın
4. Aşağıdaki 3 policy'yi ekleyin:

### Policy 1: Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );
```

### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
);
```

### Policy 3: Authenticated Delete
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
);
```

**NOT:** Her policy için:
1. **New Policy** → **For full customization** seçin
2. Policy adını girin
3. SQL kodunu yapıştırın
4. **Review** → **Save policy** tıklayın

---

## 4️⃣ Mevcut Kullanıcı Şifrelerini Güncelle (Opsiyonel)

Eğer mevcut kullanıcıların şifrelerini görmek istiyorsanız, şifreleri manuel olarak güncellemeniz gerekiyor.

### SQL Editor'de:
```sql
-- Baran kullanıcısı için
UPDATE users 
SET password = 'BARANbaba123' 
WHERE username = 'baran';

-- Diğer kullanıcılar için de aynı şekilde
UPDATE users 
SET password = 'gerçek_şifre' 
WHERE username = 'kullanıcı_adı';
```

**NOT:** Yeni eklenen kullanıcılar için şifre otomatik olarak kaydedilecek.

---

## ✅ Kontrol Listesi

Tüm adımları tamamladıktan sonra kontrol edin:

- [ ] SQL migration çalıştırıldı
- [ ] `product-images` bucket oluşturuldu
- [ ] Bucket **public** olarak işaretlendi
- [ ] 3 storage policy eklendi
- [ ] (Opsiyonel) Mevcut kullanıcı şifreleri güncellendi

---

## 🧪 Test Etme

### Şifre Görüntüleme Testi:
1. Owner paneline giriş yapın: `/login?type=owner`
2. Kullanıcılar sayfasına gidin
3. Bir kullanıcının yanındaki göz ikonuna tıklayın
4. Şifre görünmeli

### Resim Yükleme Testi:
1. Admin paneline giriş yapın: `/login?type=admin`
2. Ürünler sayfasına gidin
3. Yeni Ürün ekleyin
4. "Bilgisayardan Resim Yükle" butonuna tıklayın
5. Bir resim seçin
6. Resim yüklenmeli ve önizleme görünmeli

---

## 🐛 Sorun mu Yaşıyorsunuz?

### Resim yüklenmiyor:
- Storage bucket'ının oluşturulduğunu kontrol edin
- Bucket'ın **public** olduğunu kontrol edin
- Policies'lerin eklendiğini kontrol edin

### Şifreler görünmüyor:
- SQL migration'ın çalıştırıldığını kontrol edin
- `users` tablosunda `password` kolonunun olduğunu kontrol edin
- Mevcut kullanıcılar için `password` değerinin dolu olduğunu kontrol edin

### Hata mesajları:
- Browser console'u açın (F12)
- Network tab'ında hataları kontrol edin
- Supabase Dashboard'da Logs'ları kontrol edin

---

## 📞 Yardım

Sorun yaşamaya devam ederseniz:
1. Supabase Dashboard → Settings → API → URL ve Keys'leri kontrol edin
2. `.env.local` dosyasındaki değerlerin doğru olduğunu kontrol edin
3. Vercel'de Environment Variables'ların ayarlandığını kontrol edin
