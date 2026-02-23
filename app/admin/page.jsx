'use client'

import Link from 'next/link'
import { 
  LayoutDashboard, 
  Store, 
  FolderTree, 
  UtensilsCrossed, 
  Table2,
  Bell,
  ShoppingBag,
  Users,
  Activity,
  ChefHat,
  BarChart3,
  Wallet,
  Package,
  Calendar
} from 'lucide-react'

export default function AdminPage() {
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Talepleri görüntüle ve yönet',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      color: 'bg-blue-500',
    },
    {
      title: 'Restoran Ayarları',
      description: 'Restoran bilgilerini düzenle',
      href: '/admin/restaurant',
      icon: Store,
      color: 'bg-purple-500',
    },
    {
      title: 'Kategoriler',
      description: 'Kategori ekle, düzenle, sil',
      href: '/admin/categories',
      icon: FolderTree,
      color: 'bg-green-500',
    },
    {
      title: 'Ürünler',
      description: 'Ürün ekle, düzenle, fotoğraf yükle',
      href: '/admin/products',
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
    },
    {
      title: 'Masalar',
      description: 'Masa ekle ve QR kod oluştur',
      href: '/admin/tables',
      icon: Table2,
      color: 'bg-cyan-500',
    },
    {
      title: 'Garsonlar',
      description: 'Garson ekle ve PIN kodları yönet',
      href: '/admin/waiters',
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      title: 'Siparişler',
      description: 'Siparişleri görüntüle ve yönet',
      href: '/admin/orders',
      icon: ShoppingBag,
      color: 'bg-red-500',
    },
    {
      title: 'Bildirim Ayarları',
      description: 'Ses ve bildirim tercihlerini ayarla',
      href: '/admin/notifications',
      icon: Bell,
      color: 'bg-yellow-500',
    },
    {
      title: 'Aktivite Logları',
      description: 'Tüm işlemleri görüntüle ve takip et',
      href: '/admin/logs',
      icon: Activity,
      color: 'bg-indigo-500',
    },
    {
      title: 'Mutfak Ekranı',
      description: 'Siparişleri mutfak görünümünde takip et',
      href: '/kitchen',
      icon: ChefHat,
      color: 'bg-red-600',
    },
    {
      title: 'Satış Raporları',
      description: 'Detaylı satış analizi ve istatistikler',
      href: '/admin/reports',
      icon: BarChart3,
      color: 'bg-emerald-500',
    },
    {
      title: 'Kasa Yönetimi',
      description: 'Günlük kasa raporu ve ödeme takibi',
      href: '/admin/cashier',
      icon: Wallet,
      color: 'bg-teal-500',
    },
    {
      title: 'Stok Yönetimi',
      description: 'Ürün stok takibi ve yönetimi',
      href: '/admin/stock',
      icon: Package,
      color: 'bg-amber-500',
    },
    {
      title: 'Rezervasyonlar',
      description: 'Masa rezervasyonlarını yönetin',
      href: '/admin/reservations',
      icon: Calendar,
      color: 'bg-pink-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Restoran yönetim sistemi</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-primary/20 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
