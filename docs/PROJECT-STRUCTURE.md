# Proje Yapısı

## 📁 Dizin Yapısı

```
kafe-için/
├── app/                          # Next.js App Router
│   ├── [slug]/[tableId]/        # QR Menü (Müşteri görünümü)
│   ├── admin/                   # Admin Paneli
│   │   ├── categories/          # Kategori yönetimi
│   │   ├── products/            # Ürün yönetimi
│   │   ├── tables/              # Masa yönetimi
│   │   ├── orders/              # Sipariş yönetimi
│   │   ├── waiters/             # Garson yönetimi
│   │   ├── stock/               # Stok yönetimi
│   │   ├── cashier/             # Kasa sistemi
│   │   ├── reservations/        # Rezervasyon yönetimi
│   │   ├── reports/             # Raporlama
│   │   ├── logs/                # Audit log
│   │   ├── notifications/       # Bildirim ayarları
│   │   ├── restaurant/          # İşletme ayarları
│   │   └── dashboard/           # Dashboard
│   ├── kitchen/                 # Mutfak ekranı
│   ├── waiter/                  # Garson paneli
│   │   ├── orders/              # Sipariş alma
│   │   └── test/                # Debug sayfası (DEV)
│   ├── owner/                   # Kurucu paneli
│   ├── login/                   # Giriş sayfası
│   ├── test-login/              # Test giriş (DEV)
│   └── clear-storage/           # Storage temizleme
│
├── components/                   # React bileşenleri
│   ├── CategoryTabs.jsx
│   ├── ConfirmDialog.jsx
│   ├── ErrorMessage.jsx
│   ├── FloatingActionButton.jsx
│   ├── Footer.jsx
│   ├── LoadingSpinner.jsx
│   ├── MenuClient.jsx
│   ├── MenuHeader.jsx
│   ├── PaymentModal.jsx
│   ├── ProductCard.jsx
│   ├── ProductList.jsx
│   ├── RequestCard.jsx
│   ├── SearchBar.jsx
│   ├── ServiceRequestModal.jsx
│   └── Toast.jsx
│
├── lib/                         # Yardımcı fonksiyonlar
│   ├── auditLog.js             # Audit log sistemi
│   ├── auth.js                 # Auth yönetimi
│   ├── cache.js                # Cache yönetimi
│   ├── gestures.js             # Touch gesture'lar
│   ├── notification.js         # Bildirim sistemi
│   ├── pwa.js                  # PWA fonksiyonları
│   ├── responsive.js           # Responsive yardımcılar
│   ├── supabase.js             # Supabase client
│   ├── toast.js                # Toast notification
│   └── utils.js                # Genel yardımcılar
│
├── public/                      # Statik dosyalar
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
│
├── sql-migrations/              # SQL migration dosyaları
│   ├── supabase-schema.sql
│   ├── supabase-auth-schema.sql
│   ├── add-loyalty-system.sql
│   ├── add-payment-method.sql
│   ├── add-reservation-system.sql
│   ├── add-stock-management.sql
│   ├── add-stock-trigger.sql
│   ├── create-audit-log-table.sql
│   ├── fix-orders-waiter-reference.sql
│   ├── fix-rls-policies.sql
│   ├── reset-system.sql
│   ├── supabase-auth-update.sql
│   ├── supabase-fix-delete.sql
│   └── supabase-fix-users-delete.sql
│
├── docs/                        # Dokümantasyon
│   ├── DEPLOYMENT.md
│   ├── OPTIMIZATION-REPORT.md
│   ├── PROJECT-STATUS.md
│   ├── QUICK-START.md
│   └── TEST-GUIDE.md
│
├── .kiro/                       # Kiro IDE ayarları
│   └── specs/                  # Spec dosyaları
│
├── .env.local                   # Environment variables
├── .env.example                 # Environment örneği
├── next.config.js               # Next.js config
├── tailwind.config.js           # Tailwind config
├── package.json                 # Dependencies
└── README.md                    # Ana dokümantasyon
```

## 🎯 Önemli Dosyalar

### Konfigürasyon
- `.env.local` - Supabase credentials (GİZLİ)
- `.env.example` - Environment template
- `next.config.js` - Next.js ayarları
- `tailwind.config.js` - Tailwind CSS ayarları

### Auth & Security
- `lib/auth.js` - Authentication logic
- `sql-migrations/supabase-auth-schema.sql` - Auth schema
- `sql-migrations/fix-rls-policies.sql` - Row Level Security

### Database
- `sql-migrations/supabase-schema.sql` - Ana schema
- `sql-migrations/create-audit-log-table.sql` - Audit log
- `sql-migrations/add-*.sql` - Feature migrations

### PWA
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service Worker
- `lib/pwa.js` - PWA utilities

## 🚀 Geliştirme Notları

### Test Sayfaları (Production'da kaldırılmalı)
- `/test-login` - Test giriş sayfası
- `/waiter/test` - Waiter auth test
- `/clear-storage` - Storage temizleme

### Debug Araçları
- Browser console'da `localStorage.getItem('auth_user')`
- `/clear-storage` sayfası ile cache temizleme
- `/waiter/test` ile auth durumu kontrolü

## 📦 Bağımlılıklar

### Ana Bağımlılıklar
- Next.js 15.1.4
- React 19
- Supabase Client
- Tailwind CSS
- Lucide React (icons)

### Dev Bağımlılıklar
- ESLint
- PostCSS
- Autoprefixer

## 🔐 Güvenlik

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### RLS Policies
Tüm tablolarda Row Level Security aktif. Detaylar:
- `sql-migrations/fix-rls-policies.sql`

### Auth Flow
1. Login → `lib/auth.js`
2. Store → localStorage + sessionStorage
3. Check → `getAuthUser()` + role check
4. Redirect → Role-based routing

## 📱 Responsive & PWA

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### PWA Features
- Offline support
- Install prompt
- Push notifications
- Background sync

## 🎨 Styling

### Tailwind Classes
- Primary color: `bg-primary`, `text-primary`
- Spacing: Tailwind default scale
- Shadows: `shadow-sm`, `shadow-lg`
- Rounded: `rounded-lg`, `rounded-xl`

### Custom CSS
- `app/globals.css` - Global styles
- CSS variables for theming

## 🔄 State Management

### Client State
- React useState/useEffect
- localStorage/sessionStorage

### Server State
- Supabase Realtime
- Polling (30s intervals)

### Cache
- `lib/cache.js` - Cache utilities (henüz kullanılmıyor)

## 📊 Monitoring

### Audit Log
- Tüm önemli işlemler loglanıyor
- `lib/auditLog.js`
- `/admin/logs` sayfasında görüntüleme

### Error Tracking
- Console.error kullanımı
- Error boundaries
- User-friendly error messages

## 🚦 Deployment

Detaylı deployment bilgisi için:
- `docs/DEPLOYMENT.md`
- `docs/QUICK-START.md`

## 📝 Notlar

- Test sayfaları production'da kaldırılmalı
- Console.log'lar temizlenmeli
- Cache sistemi aktif edilmeli
- Image optimization yapılmalı
