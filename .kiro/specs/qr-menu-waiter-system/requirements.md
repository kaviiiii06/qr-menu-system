# Gereksinimler Dokümanı

## Giriş

QR Menü ve Garson Çağırma Sistemi, restoranların müşterilerine dijital menü sunmasını ve garson çağırma/hesap isteme gibi hizmet taleplerini gerçek zamanlı olarak yönetmesini sağlayan bir SaaS MVP uygulamasıdır. Sistem, Next.js 14+ (App Router), Supabase ve Tailwind CSS teknolojileri kullanılarak geliştirilecektir.

## Gereksinimler

### Gereksinim 1: Supabase Entegrasyonu ve Yapılandırma

**Kullanıcı Hikayesi:** Geliştirici olarak, uygulamanın Supabase ile güvenli bir şekilde iletişim kurabilmesi için yapılandırma ayarlarını yapmak istiyorum, böylece veritabanı işlemleri ve kimlik doğrulama çalışabilir.

#### Kabul Kriterleri

1. WHEN uygulama başlatıldığında THEN sistem Supabase istemcisini (`lib/supabase.js`) başarıyla oluşturmalıdır
2. WHEN Supabase istemcisi oluşturulduğunda THEN sistem `.env.local` dosyasındaki `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini kullanmalıdır
3. IF `.env.local` dosyası eksik veya hatalı ise THEN sistem anlamlı bir hata mesajı göstermelidir
4. WHEN veritabanı şeması oluşturulduğunda THEN sistem aşağıdaki tabloları içermelidir: restaurants, tables, categories, products, service_requests

### Gereksinim 2: Veritabanı Şeması ve İlişkiler

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, restoran verilerinin doğru bir şekilde saklanması ve ilişkilendirilmesi için uygun veritabanı yapısına ihtiyacım var, böylece veri bütünlüğü sağlanabilir.

#### Kabul Kriterleri

1. WHEN `restaurants` tablosu oluşturulduğunda THEN tablo şu alanları içermelidir: id (UUID, primary key), name (text), slug (text, unique), logo_url (text, nullable)
2. WHEN `tables` tablosu oluşturulduğunda THEN tablo şu alanları içermelidir: id (UUID, primary key), restaurant_id (UUID, foreign key), table_number (integer), qr_code_uuid (UUID, unique)
3. WHEN `categories` tablosu oluşturulduğunda THEN tablo şu alanları içermelidir: id (UUID, primary key), restaurant_id (UUID, foreign key), name (text), sort_order (integer)
4. WHEN `products` tablosu oluşturulduğunda THEN tablo şu alanları içermelidir: id (UUID, primary key), category_id (UUID, foreign key), name (text), description (text, nullable), price (decimal), image_url (text, nullable), is_available (boolean, default true)
5. WHEN `service_requests` tablosu oluşturulduğunda THEN tablo şu alanları içermelidir: id (UUID, primary key), table_id (UUID, foreign key), restaurant_id (UUID, foreign key), type (enum: 'CALL_WAITER', 'REQUEST_BILL'), status (enum: 'PENDING', 'COMPLETED'), created_at (timestamp with time zone, default now())
6. WHEN bir tablo silindiğinde THEN ilişkili kayıtlar CASCADE ile silinmelidir (foreign key constraints)

### Gereksinim 3: Müşteri Menü Arayüzü

**Kullanıcı Hikayesi:** Restoran müşterisi olarak, masadaki QR kodu okuttuğumda mobil cihazımda restoranın menüsünü görmek istiyorum, böylece sipariş verebilir ve garson çağırabilirim.

#### Kabul Kriterleri

1. WHEN müşteri `/[slug]/[tableId]` URL'sine eriştiğinde THEN sistem ilgili restoranın menüsünü göstermelidir
2. WHEN menü yüklendiğinde THEN sistem kategorilere göre gruplandırılmış ürünleri göstermelidir
3. WHEN müşteri kategoriler arasında geçiş yapmak istediğinde THEN sistem tab sistemi veya scroll ile geçiş imkanı sunmalıdır
4. WHEN bir ürün gösterildiğinde THEN ürün kartı şu bilgileri içermelidir: ürün adı, açıklama, fiyat, görsel (varsa)
5. IF bir ürün stokta yoksa (`is_available = false`) THEN ürün kartı görsel olarak devre dışı görünmeli ve "Stokta Yok" etiketi göstermelidir
6. WHEN menü sayfası yüklendiğinde THEN sayfa mobil uyumlu (responsive) olmalıdır
7. WHEN sayfa scroll edildiğinde THEN ekranın sağ altında sabit (sticky) konumda "Garson Çağır" butonu görünür olmalıdır
8. WHEN "Garson Çağır" butonuna basıldığında THEN sistem kullanıcıya "Garson Çağır" veya "Hesap İste" seçeneklerini sunmalıdır
9. WHEN kullanıcı bir seçenek seçtiğinde THEN sistem `service_requests` tablosuna yeni bir kayıt eklemelidir (type: 'CALL_WAITER' veya 'REQUEST_BILL', status: 'PENDING')
10. WHEN hizmet talebi başarıyla oluşturulduğunda THEN sistem kullanıcıya "Talebiniz alındı" gibi bir onay mesajı göstermelidir
11. IF hizmet talebi oluşturulamazsa THEN sistem kullanıcıya hata mesajı göstermelidir

### Gereksinim 4: Garson/İşletme Paneli

**Kullanıcı Hikayesi:** Garson veya restoran yöneticisi olarak, müşterilerden gelen hizmet taleplerini gerçek zamanlı olarak görmek ve yönetmek istiyorum, böylece hızlı bir şekilde müşteri memnuniyetini sağlayabilirim.

#### Kabul Kriterleri

1. WHEN garson `/admin/dashboard` sayfasına eriştiğinde THEN sistem bekleyen (PENDING) hizmet taleplerini listelemeli
2. WHEN dashboard yüklendiğinde THEN sistem Supabase Realtime kullanarak `service_requests` tablosunu dinlemeye başlamalıdır
3. WHEN yeni bir hizmet talebi oluşturulduğunda (INSERT) THEN sistem sayfayı yenilemeden anında talebi listeye eklemelidir
4. WHEN yeni bir talep geldiğinde THEN sistem sesli uyarı (audio notification) çalmalıdır
5. WHEN yeni bir talep geldiğinde THEN sistem görsel uyarı (toast/alert) göstermelidir
6. WHEN bir talep kartı gösterildiğinde THEN kart şu bilgileri içermelidir: masa numarası, talep tipi (Garson Çağır/Hesap İste), oluşturulma zamanı, "Tamamlandı" butonu
7. WHEN garson "Tamamlandı" butonuna bastığında THEN sistem ilgili talebin status değerini 'COMPLETED' olarak güncellemeli (UPDATE)
8. WHEN bir talep tamamlandığında THEN sistem talebi listeden kaldırmalıdır
9. WHEN dashboard sayfası kapatıldığında THEN sistem Realtime dinlemeyi durdurmalıdır (cleanup)
10. IF Realtime bağlantısı koparsa THEN sistem otomatik olarak yeniden bağlanmayı denemeli

### Gereksinim 5: Tasarım ve Kullanıcı Deneyimi

**Kullanıcı Hikayesi:** Uygulama kullanıcısı olarak, modern, temiz ve kullanımı kolay bir arayüz görmek istiyorum, böylece uygulamayı rahatça kullanabilirim.

#### Kabul Kriterleri

1. WHEN herhangi bir sayfa yüklendiğinde THEN sayfa Tailwind CSS ile stillendirilmiş olmalıdır
2. WHEN tasarım uygulandığında THEN sistem mobile-first yaklaşımı kullanmalıdır
3. WHEN renk paleti uygulandığında THEN arka plan açık gri (#f3f4f6) olmalıdır
4. WHEN renk paleti uygulandığında THEN ana renk (primary) koyu turuncu (#ea580c) olmalıdır
5. WHEN UI bileşenleri oluşturulduğunda THEN bileşenler "Card" yapısına dayalı olmalıdır
6. WHEN butonlar oluşturulduğunda THEN butonlar büyük ve dokunmatik ekran dostu olmalıdır (minimum 44x44px)
7. WHEN ikonlar kullanıldığında THEN sistem Lucide-React ikonlarını kullanmalıdır
8. WHEN sayfa yüklenirken THEN sistem loading state göstermelidir
9. WHEN bir hata oluştuğunda THEN sistem kullanıcı dostu hata mesajları göstermelidir
10. WHEN sayfa mobil cihazda görüntülendiğinde THEN tüm öğeler dokunmatik kullanıma uygun olmalıdır

### Gereksinim 6: Performans ve Güvenlik

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, uygulamanın hızlı, güvenli ve ölçeklenebilir olmasını istiyorum, böylece kullanıcı deneyimi kesintisiz olur.

#### Kabul Kriterleri

1. WHEN sayfa yüklendiğinde THEN sistem Next.js App Router'ın server-side rendering özelliklerini kullanmalıdır
2. WHEN görsel yüklendiğinde THEN sistem Next.js Image bileşenini kullanarak optimize edilmiş görseller sunmalıdır
3. WHEN API çağrısı yapıldığında THEN sistem uygun hata yönetimi (try-catch) kullanmalıdır
4. WHEN Supabase sorguları yapıldığında THEN sistem Row Level Security (RLS) politikalarına uymalıdır
5. IF kullanıcı yetkisiz bir sayfaya erişmeye çalışırsa THEN sistem erişimi engellemeli ve uygun hata sayfası göstermelidir
6. WHEN Realtime bağlantısı kurulduğunda THEN sistem bağlantı durumunu izlemeli ve hata durumunda kullanıcıyı bilgilendirmelidir
