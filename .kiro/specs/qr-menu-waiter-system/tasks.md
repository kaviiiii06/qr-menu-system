# İmplementasyon Planı

- [x] 1. Proje yapısını oluştur ve temel konfigürasyonları yap



  - Next.js 14+ projesi oluştur (App Router ile)
  - Gerekli paketleri yükle: @supabase/supabase-js, lucide-react, tailwindcss
  - `.env.local` dosyası oluştur ve Supabase credentials için placeholder ekle
  - `tailwind.config.js` dosyasını özelleştir (renk paleti: primary #ea580c, background #f3f4f6)
  - `app/globals.css` dosyasını yapılandır



  - _Gereksinimler: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4_

- [ ] 2. Supabase client ve veritabanı şemasını oluştur
  - `lib/supabase.js` dosyasını oluştur ve Supabase client'ı yapılandır



  - Supabase SQL migration dosyası oluştur (tüm tablolar ve ilişkiler)
  - RLS politikalarını tanımla ve aktifleştir
  - Index'leri ekle (performans için)
  - _Gereksinimler: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.4_

- [x] 3. Müşteri menü sayfası için temel yapıyı oluştur



  - `app/[slug]/[tableId]/page.jsx` dosyasını oluştur (Server Component)
  - Slug ve tableId parametrelerini al ve validate et
  - Supabase'den restoran bilgilerini çek
  - Masa bilgilerini doğrula



  - 404 sayfası oluştur (geçersiz slug/tableId için)
  - Loading state ekle
  - _Gereksinimler: 3.1, 3.6, 6.1, 6.3_

- [ ] 4. Menü header ve restoran bilgilerini göster
  - `components/MenuHeader.jsx` client component'i oluştur
  - Restoran logosu göster (Next.js Image ile optimize et)



  - Masa numarasını göster
  - Responsive tasarım uygula
  - _Gereksinimler: 3.1, 5.1, 5.5, 5.6, 6.2_

- [x] 5. Kategori ve ürün listesini implement et



  - Supabase'den kategorileri ve ürünleri çek (sort_order'a göre sırala)
  - `components/CategoryTabs.jsx` client component'i oluştur
  - `components/ProductCard.jsx` component'i oluştur
  - Ürün kartlarında: isim, açıklama, fiyat, görsel göster
  - Stokta olmayan ürünler için "Stokta Yok" etiketi ekle
  - Fiyat formatlama fonksiyonu yaz



  - Kategoriler arası geçiş (tab sistemi) ekle
  - _Gereksinimler: 3.2, 3.3, 3.4, 3.5, 5.5, 5.6, 6.2_

- [ ] 6. Floating action button ve hizmet talebi modalını oluştur
  - `components/FloatingActionButton.jsx` component'i oluştur



  - Sticky positioning (sağ alt köşe) uygula
  - `components/ServiceRequestModal.jsx` component'i oluştur
  - "Garson Çağır" ve "Hesap İste" butonlarını ekle
  - Modal açma/kapama state yönetimi
  - _Gereksinimler: 3.7, 3.8, 5.5, 5.6, 5.10_




- [ ] 7. Hizmet talebi oluşturma fonksiyonunu implement et
  - Modal'dan talep tipini al (CALL_WAITER veya REQUEST_BILL)
  - Supabase'e INSERT sorgusu gönder (service_requests tablosuna)
  - Loading state ekle (talep gönderilirken)
  - Başarı mesajı göster (toast/alert)



  - Hata yönetimi ekle (try-catch)
  - Hata durumunda kullanıcı dostu mesaj göster
  - _Gereksinimler: 3.9, 3.10, 3.11, 5.8, 5.9, 6.3_

- [ ] 8. Garson dashboard sayfasını oluştur
  - `app/admin/dashboard/page.jsx` dosyasını oluştur (Client Component)



  - Dashboard header ekle (başlık ve refresh butonu)
  - Supabase'den PENDING durumundaki talepleri çek
  - Loading state ekle
  - Boş state ekle (talep yoksa)
  - _Gereksinimler: 4.1, 5.8_

- [ ] 9. Request card component'ini oluştur
  - `components/RequestCard.jsx` component'i oluştur
  - Masa numarası badge ekle
  - Talep tipi ikonu göster (Lucide-React: Bell veya Receipt)
  - Zaman damgası göster (relative time formatında)
  - "Tamamlandı" butonu ekle
  - Card tasarımını uygula


  - _Gereksinimler: 4.6, 5.5, 5.6, 5.7_

- [ ] 10. Talep tamamlama fonksiyonunu implement et
  - "Tamamlandı" butonuna click handler ekle
  - Supabase'de UPDATE sorgusu çalıştır (status = 'COMPLETED')
  - Optimistic update uygula (UI'dan hemen kaldır)
  - Hata durumunda geri al (rollback)
  - Loading state ekle
  - _Gereksinimler: 4.7, 4.8, 6.3_

- [x] 11. Supabase Realtime entegrasyonunu implement et



  - Dashboard'da Realtime channel oluştur
  - service_requests tablosunu dinle (INSERT event)
  - Yeni talep geldiğinde state'i güncelle
  - Component unmount olduğunda channel'ı temizle (cleanup)
  - Bağlantı durumu state'i ekle
  - Bağlantı kopması durumunda otomatik yeniden bağlanma
  - _Gereksinimler: 4.2, 4.3, 4.9, 4.10_

- [ ] 12. Bildirim sistemini implement et
  - Ses bildirimi için audio dosyası ekle (public/notification.mp3)
  - Yeni talep geldiğinde ses çal
  - Toast/alert component'i oluştur
  - Yeni talep geldiğinde görsel bildirim göster
  - Bildirim izni kontrolü ekle (browser permission)
  - _Gereksinimler: 4.4, 4.5, 5.9_

- [ ]* 13. Test verisi oluştur ve manuel test yap
  - Supabase'de örnek restoran verisi ekle
  - Örnek kategoriler ve ürünler ekle
  - Örnek masa kayıtları oluştur
  - QR kod URL'lerini test et
  - Tüm akışları manuel olarak test et
  - _Gereksinimler: Tüm gereksinimler_

- [ ]* 14. Error boundary ve hata sayfalarını oluştur
  - `app/error.jsx` dosyası oluştur (500 hatası için)
  - `app/not-found.jsx` dosyası oluştur (404 hatası için)
  - Kullanıcı dostu hata mesajları ekle
  - _Gereksinimler: 5.9, 6.3, 6.5_

- [ ]* 15. Performans optimizasyonları yap
  - Next.js Image component'ini tüm görsellerde kullan
  - Lazy loading ekle (dinamik import)
  - Supabase sorgularını optimize et (sadece gerekli kolonlar)
  - Realtime filter ekle (sadece ilgili restaurant_id)
  - _Gereksinimler: 6.1, 6.2, 6.6_

- [ ]* 16. Deployment hazırlıkları yap
  - `.env.example` dosyası oluştur
  - README.md dosyası yaz (kurulum adımları)
  - Supabase migration script'ini dokümante et
  - Vercel deployment ayarlarını hazırla
  - _Gereksinimler: 6.4_
