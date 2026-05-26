'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4 px-4 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2 text-sm">
          <span className="text-gray-300">
            <span className="text-orange-400 font-medium">Yetkili:</span> Baran Akbulut
          </span>
          <a href="tel:05389693606" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">Tel:</span> 0538 969 36 06
          </a>
          <a href="mailto:retkid191@gmail.com" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">E-posta:</span> retkid191@gmail.com
          </a>
          <a href="https://instagram.com/one.barann" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 transition-colors">
            <span className="text-orange-400 font-medium">Instagram:</span> @one.barann
          </a>
          <span className="text-gray-300">
            <span className="text-orange-400 font-medium">Adres:</span> Türkiye
          </span>
        </div>
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} QR Menü Sistemi — Tasarım ve Geliştirme: Baran Akbulut
        </p>
      </div>
    </footer>
  )
}
