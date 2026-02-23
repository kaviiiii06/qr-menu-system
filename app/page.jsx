import Link from 'next/link'
import { Store, UserCircle, Crown } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            QR Menü Sistemi
          </h1>
          <p className="text-xl text-gray-600">
            Restoran yönetimi ve garson sipariş sistemi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kurucu Girişi */}
          <Link
            href="/login?type=owner"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 text-white hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors">
                <Crown className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Kurucu Girişi</h2>
              <p className="text-purple-100 mb-4">
                İşletme ekle, tüm sistemi yönet
              </p>
              <div className="mt-auto pt-4">
                <span className="font-semibold group-hover:underline">
                  Kurucu Paneline Git →
                </span>
              </div>
            </div>
          </Link>

          {/* İşletme Girişi */}
          <Link
            href="/login?type=admin"
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-transparent hover:border-primary/20 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Store className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                İşletme Girişi
              </h2>
              <p className="text-gray-600 mb-4">
                Restoran yönetimi, menü düzenleme, sipariş takibi
              </p>
              <div className="mt-auto pt-4">
                <span className="text-primary font-semibold group-hover:underline">
                  Yönetim Paneline Git →
                </span>
              </div>
            </div>
          </Link>

          {/* Garson Girişi */}
          <Link
            href="/login?type=waiter"
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-transparent hover:border-green-500/20 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <UserCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Garson Girişi
              </h2>
              <p className="text-gray-600 mb-4">
                Sipariş alma, masa yönetimi, müşteri hizmetleri
              </p>
              <div className="mt-auto pt-4">
                <span className="text-green-600 font-semibold group-hover:underline">
                  Garson Paneline Git →
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Müşteri menüsüne erişmek için masa QR kodunu tarayın
          </p>
        </div>
      </div>
    </div>
  )
}
