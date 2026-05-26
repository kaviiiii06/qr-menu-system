export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4 px-4 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2 text-sm">
          <span className="text-gray-300"><span className="text-orange-400 font-medium">Şirket:</span> KAVİ YAZILIM</span>
          <span className="text-gray-300"><span className="text-orange-400 font-medium">Yetkili:</span> Baran Akbulut</span>
          <a href="tel:05389693606" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">Tel:</span> 0538 969 36 06
          </a>
          <a href="mailto:kavipc06@gmail.com" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">E-posta:</span> kavipc06@gmail.com
          </a>
          <a href="https://instagram.com/baranakblttt" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">Instagram:</span> @baranakblttt
          </a>
          <span className="text-gray-300"><span className="text-orange-400 font-medium">Adres:</span> Ulubatlı Hasan Mah. Fındıklı Sok. 7/2, Ankara/Türkiye</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2 text-xs text-gray-500">
          <span>Sunucu: Vercel</span>
          <span>•</span>
          <span>Veritabanı: Supabase</span>
        </div>
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} KAVİ YAZILIM — Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}
