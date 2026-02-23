import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Sayfa Bulunamadı
        </h1>
        <p className="text-gray-600 mb-6">
          Aradığınız sayfa mevcut değil veya geçersiz bir QR kod kullandınız.
        </p>
        <Link 
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
