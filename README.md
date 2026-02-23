# 🍽️ QR Menü & Restoran Yönetim Sistemi

Modern, kapsamlı restoran yönetim sistemi. QR menü, garson paneli, mutfak ekranı, raporlama ve daha fazlası!

## ✨ Özellikler

### 👥 Müşteri Özellikleri
- ✅ Mobil uyumlu dijital menü
- ✅ QR kod ile masa tanıma
- ✅ Kategorilere göre ürün listeleme
- ✅ Garson çağırma ve hesap isteme
- ✅ Gerçek zamanlı bildirimler

### 👨‍🍳 Mutfak Özellikleri
- ✅ Mutfak ekranı (koyu tema, büyük fontlar)
- ✅ Gerçek zamanlı sipariş takibi
- ✅ Ses bildirimleri
- ✅ Renk kodlu zaman göstergesi
- ✅ Tek tıkla durum değiştirme

### 👔 Garson Özellikleri
- ✅ Sipariş oluşturma ve yönetimi
- ✅ Masa taşıma
- ✅ Ödeme yöntemi seçimi (Nakit/Kart)
- ✅ Sipariş düzenleme
- ✅ Masa kapatma

### 📊 Yönetim Özellikleri
- ✅ Satış raporları (günlük, haftalık, aylık)
- ✅ Kasa yönetimi
- ✅ Stok takibi
- ✅ Audit log sistemi
- ✅ Kullanıcı yönetimi
- ✅ Ürün ve kategori yönetimi
- ✅ Masa yönetimi

### 🚀 Teknik Özellikler
- ✅ PWA desteği (offline çalışma)
- ✅ Performans optimizasyonları (cache)
- ✅ Mobil optimizasyonlar (gestures)
- ✅ Toast bildirimleri
- ✅ Responsive tasarım

## 🛠 Teknolojiler

- **Framework**: Next.js 14+ (App Router)
- **Dil**: JavaScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Icons**: Lucide React
- **PWA**: Service Worker, Manifest

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd qr-menu-waiter-system
npm install
```

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Veritabanı Kurulumu

Supabase SQL Editor'de sırayla çalıştırın:

```sql
-- 1. Ana şema
-- supabase-schema.sql

-- 2. Auth sistemi
-- supabase-auth-schema.sql

-- 3. Audit log
-- create-audit-log-table.sql

-- 4. Ödeme yöntemi
-- add-payment-method.sql

-- 5. Stok yönetimi
-- add-stock-management.sql
```

### 4. Realtime Aktifleştirme

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 5. Geliştirme Sunucusu

```bash
npm run dev
```

Tarayıcıda: [http://localhost:3000](http://localhost:3000)

## 📱 Kullanım

### Müşteri Menü
```
http://localhost:3000/[restaurant-slug]/[table-id]
```

### Garson Paneli
```
http://localhost:3000/waiter/orders
Giriş: garson1 / garson123
```

### Mutfak Ekranı
```
http://localhost:3000/kitchen
```

### Admin Paneli
```
http://localhost:3000/admin
Giriş: manager / manager123
```

### Owner Paneli
```
http://localhost:3000/owner
Giriş: admin / admin123
```

## 📁 Proje Yapısı

```
├── app/
│   ├── [slug]/[tableId]/     # Müşteri menü
│   ├── admin/                # Admin paneli
│   │   ├── dashboard/        # Dashboard
│   │   ├── reports/          # Satış raporları
│   │   ├── cashier/          # Kasa yönetimi
│   │   ├── stock/            # Stok yönetimi
│   │   ├── logs/             # Audit logları
│   │   ├── orders/           # Sipariş yönetimi
│   │   ├── products/         # Ürün yönetimi
│   │   ├── categories/       # Kategori yönetimi
│   │   ├── tables/           # Masa yönetimi
│   │   ├── waiters/          # Kullanıcı yönetimi
│   │   └── notifications/    # Bildirim ayarları
│   ├── kitchen/              # Mutfak ekranı
│   ├── waiter/               # Garson paneli
│   ├── owner/                # Owner paneli
│   └── login/                # Giriş sayfası
├── components/               # React bileşenleri
├── lib/
│   ├── supabase.js          # Supabase client
│   ├── auth.js              # Auth helper
│   ├── auditLog.js          # Audit log helper
│   ├── cache.js             # Cache yönetimi
│   ├── pwa.js               # PWA helper
│   ├── gestures.js          # Touch gestures
│   ├── responsive.js        # Responsive utilities
│   ├── toast.js             # Toast bildirimleri
│   ├── notification.js      # Ses bildirimleri
│   └── utils.js             # Utility fonksiyonlar
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
└── SQL Scripts/
    ├── supabase-schema.sql
    ├── supabase-auth-schema.sql
    ├── create-audit-log-table.sql
    ├── add-payment-method.sql
    └── add-stock-management.sql
```

## 🎯 Özellik Detayları

### 1. Audit Log Sistemi
- Tüm kullanıcı işlemlerini kaydet
- Filtreleme ve arama
- CSV export
- Detaylı log görüntüleme

### 2. Mutfak Ekranı
- Gerçek zamanlı sipariş takibi
- Koyu tema (göz yormaz)
- Büyük fontlar (uzaktan okunabilir)
- Ses bildirimleri
- Renk kodlu zaman (yeşil/sarı/kırmızı)

### 3. Satış Raporları
- Dönem seçimi (bugün, dün, hafta, ay, özel)
- Toplam gelir, sipariş, ortalama
- En çok satan ürünler (Top 5)
- En iyi garsonlar (Top 5)
- Saatlik dağılım grafiği
- CSV export

### 4. Kasa Yönetimi
- Günlük kasa raporu
- Nakit/Kredi kartı ayrımı
- Açılış/Kapanış kasası
- Detaylı sipariş listesi
- CSV export

### 5. Stok Yönetimi
- Ürün bazlı stok takibi
- Stok giriş/çıkış/düzeltme
- Düşük stok uyarısı
- Stok hareket geçmişi
- Eşik değer belirleme

### 6. PWA Desteği
- Offline çalışma
- Ana ekrana ekleme
- Push notifications (TODO)
- Background sync (TODO)

### 7. Mobil Optimizasyonlar
- Touch gestures (swipe, long press)
- Haptic feedback
- Pull to refresh
- Responsive design
- Safe area insets

## 🔒 Güvenlik

- ✅ Row Level Security (RLS)
- ✅ Auth kontrolleri
- ✅ Rol bazlı erişim (OWNER, MANAGER, WAITER)
- ✅ Environment variables
- ✅ XSS koruması
- ✅ CSRF koruması

## 📊 Performans

- ✅ In-memory cache (TTL desteği)
- ✅ Service worker cache
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Image optimization
- ✅ Minimal re-renders

## 🧪 Test

Detaylı test senaryoları: `TEST-GUIDE.md`

**Hızlı Test:**
```bash
# 1. Veritabanı scriptlerini çalıştırın
# 2. Test kullanıcıları ile giriş yapın
# 3. Her özelliği test edin
```

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# 1. GitHub'a push
git push origin main

# 2. Vercel'de import
# 3. Environment variables ekle
# 4. Deploy
```

### Production Checklist

- [ ] Environment variables ✓
- [ ] Supabase RLS aktif ✓
- [ ] Realtime çalışıyor ✓
- [ ] PWA test edildi ✓
- [ ] Mobil test edildi ✓
- [ ] QR kodlar oluşturuldu ✓
- [ ] Test verisi temizlendi ✓

## 📚 Dokümantasyon

- `README.md` - Bu dosya
- `TEST-GUIDE.md` - Test rehberi
- `DEPLOYMENT.md` - Deployment rehberi
- `FINAL-SUMMARY.md` - Tüm özellikler özeti
- `AUDIT-LOG-INTEGRATION.md` - Audit log detayları
- `PAYMENT-METHOD-UPDATE.md` - Ödeme yöntemi rehberi

## 🎨 Özelleştirme

### Renk Teması
`tailwind.config.js`:
```javascript
colors: {
  primary: '#ea580c',
  background: '#f3f4f6',
}
```

### PWA
`public/manifest.json`:
```json
{
  "name": "QR Menü",
  "theme_color": "#ea580c"
}
```

## 🐛 Sorun Giderme

### Realtime Çalışmıyor
```sql
-- Supabase'de çalıştırın
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### Auth Hatası
```javascript
// localStorage'ı temizleyin
localStorage.clear()
```

### Cache Sorunu
```javascript
// Cache'i temizleyin
import { cache } from '@/lib/cache'
cache.clear()
```

## 📈 Roadmap

### Kısa Vadeli
- [ ] Mutfak ekranına auth
- [ ] Garson ödeme modalı
- [ ] Stok otomatik düşüş
- [ ] Virtual scrolling
- [ ] Image optimization

### Orta Vadeli
- [ ] Push notifications
- [ ] Background sync
- [ ] Rezervasyon sistemi
- [ ] Müşteri sadakat programı
- [ ] QR kod ile ödeme

### Uzun Vadeli
- [ ] Native app (React Native)
- [ ] Desktop app (Electron)
- [ ] Multi-language
- [ ] Dark mode
- [ ] AI tahmin sistemi

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing`)
5. Pull Request açın

## 📞 Destek

- 📧 Email: support@example.com
- 💬 Discord: [Link]
- 📖 Docs: [Link]
- 🐛 Issues: GitHub Issues

## 📄 Lisans

MIT License - Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Your Name]
