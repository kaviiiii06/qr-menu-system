'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, clearAuthUser, isOwner } from '@/lib/auth'
import { ArrowLeft, Users, Table2, FolderTree, UtensilsCrossed, ShoppingBag, LogOut, LayoutDashboard, Store, Bell, Activity, ChefHat, BarChart3, Wallet, Package, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function RestaurantManagePage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id
  
  const [user, setUser] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [stats, setStats] = useState({
    users: 0,
    tables: 0,
    categories: 0,
    products: 0,
    orders: 0
  })

  useEffect(() => {
    const authUser = getAuthUser()
    if (!authUser || !isOwner(authUser)) {
      router.push('/login?type=owner')
      return
    }
    setUser(authUser)
    loadRestaurant()
    loadStats()
  }, [router, restaurantId])

  const loadRestaurant = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()
    
    if (data) setRestaurant(data)
  }

  const loadStats = async () => {
    try {
      // Tüm sorguları paralel çalıştır
      const [usersResult, tablesResult, categoriesResult, ordersResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
        supabase.from('tables').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
        supabase.from('categories').select('id', { count: 'exact' }).eq('restaurant_id', restaurantId),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId)
      ])

      // Ürün sayısını kategorilerden hesapla
      let productsCount = 0
      if (categoriesResult.data && categoriesResult.data.length > 0) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .in('category_id', categoriesResult.data.map(c => c.id))
        productsCount = count || 0
      }

      setStats({
        users: usersResult.count || 0,
        tables: tablesResult.count || 0,
        categories: categoriesResult.count || 0,
        products: productsCount,
        orders: ordersResult.count || 0
      })
    } catch (error) {
      console.error('Stats loading error:', error)
    }
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push('/')
  }

  if (!user || !restaurant) {
    return null
  }

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Talepleri görüntüle ve yönet',
      href: `/owner/restaurant/${restaurantId}/dashboard`,
      icon: LayoutDashboard,
      color: 'bg-blue-500',
    },
    {
      title: 'Restoran Ayarları',
      description: 'Restoran bilgilerini düzenle',
      href: `/owner/restaurant/${restaurantId}`,
      icon: Store,
      color: 'bg-purple-500',
    },
    {
      title: 'Kategoriler',
      description: 'Kategori ekle, düzenle, sil',
      href: `/owner/restaurant/${restaurantId}/categories`,
      icon: FolderTree,
      color: 'bg-green-500',
      count: stats.categories
    },
    {
      title: 'Ürünler',
      description: 'Ürün ekle, düzenle, fotoğraf yükle',
      href: `/owner/restaurant/${restaurantId}/products`,
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      count: stats.products
    },
    {
      title: 'Masalar',
      description: 'Masa ekle ve QR kod oluştur',
      href: `/owner/restaurant/${restaurantId}/tables`,
      icon: Table2,
      color: 'bg-cyan-500',
      count: stats.tables
    },
    {
      title: 'Kullanıcılar',
      description: 'Yönetici ve garson hesapları',
      href: `/owner/restaurant/${restaurantId}/users`,
      icon: Users,
      color: 'bg-indigo-500',
      count: stats.users
    },
    {
      title: 'Siparişler',
      description: 'Siparişleri görüntüle ve yönet',
      href: `/owner/restaurant/${restaurantId}/orders`,
      icon: ShoppingBag,
      color: 'bg-red-500',
      count: stats.orders
    },
    {
      title: 'Bildirim Ayarları',
      description: 'Ses ve bildirim tercihlerini ayarla',
      href: `/admin/notifications`,
      icon: Bell,
      color: 'bg-yellow-500',
    },
    {
      title: 'Aktivite Logları',
      description: 'Tüm işlemleri görüntüle ve takip et',
      href: `/admin/logs`,
      icon: Activity,
      color: 'bg-indigo-500',
    },
    {
      title: 'Mutfak Ekranı',
      description: 'Siparişleri mutfak görünümünde takip et',
      href: `/kitchen`,
      icon: ChefHat,
      color: 'bg-red-600',
    },
    {
      title: 'Satış Raporları',
      description: 'Detaylı satış analizi ve istatistikler',
      href: `/admin/reports`,
      icon: BarChart3,
      color: 'bg-emerald-500',
    },
    {
      title: 'Kasa Yönetimi',
      description: 'Günlük kasa raporu ve ödeme takibi',
      href: `/admin/cashier`,
      icon: Wallet,
      color: 'bg-teal-500',
    },
    {
      title: 'Stok Yönetimi',
      description: 'Ürün stok takibi ve yönetimi',
      href: `/admin/stock`,
      icon: Package,
      color: 'bg-amber-500',
    },
    {
      title: 'Rezervasyonlar',
      description: 'Masa rezervasyonlarını yönetin',
      href: `/admin/reservations`,
      icon: Calendar,
      color: 'bg-pink-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/owner')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-600 mt-1">İşletme Yönetim Paneli</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Çıkış
            </button>
          </div>
        </div>
      </div>

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
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.count !== null && (
                        <span className="text-2xl font-bold text-gray-400">
                          {item.count}
                        </span>
                      )}
                    </div>
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
