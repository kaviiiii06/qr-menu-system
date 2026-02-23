'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Download } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function ReportsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    topWaiters: [],
    hourlyData: []
  })

  useEffect(() => {
    const user = getAuthUser()
    if (!user || (!isManager(user) && user.role !== 'OWNER')) {
      router.push('/login?type=admin')
      return
    }

    if (user.role === 'OWNER') {
      fetchFirstRestaurant()
    } else {
      if (!user.restaurant_id) {
        alert('Kullanıcı bir işletmeye bağlı değil.')
        router.push('/')
        return
      }
      loadData(user.restaurant_id)
    }
  }, [router, dateRange, customStartDate, customEndDate])

  const fetchFirstRestaurant = async () => {
    try {
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single()

      if (error || !restaurantData) {
        alert('Henüz işletme eklenmemiş!')
        router.push('/owner')
        return
      }

      setRestaurant(restaurantData)
      loadData(restaurantData.id)
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    let startDate, endDate

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = new Date(yesterday.setHours(0, 0, 0, 0))
        endDate = new Date(yesterday.setHours(23, 59, 59, 999))
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        endDate = new Date()
        break
      case 'month':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        endDate = new Date()
        break
      case 'custom':
        if (!customStartDate || !customEndDate) return null
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate + 'T23:59:59')
        break
      default:
        return null
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
  }

  const loadData = async (restaurantId) => {
    setIsLoading(true)
    const range = getDateRange()
    if (!range) {
      setIsLoading(false)
      return
    }

    try {
      // Siparişleri çek
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          users (full_name),
          order_items (
            *,
            products (name)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', range.startDate)
        .lte('created_at', range.endDate)
        .in('status', ['PAID', 'DELIVERED'])

      if (orders) {
        // Toplam gelir
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        
        // Ortalama sipariş değeri
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

        // En çok satan ürünler
        const productMap = {}
        orders.forEach(order => {
          order.order_items?.forEach(item => {
            const name = item.products?.name || 'Bilinmeyen'
            if (!productMap[name]) {
              productMap[name] = { name, quantity: 0, revenue: 0 }
            }
            productMap[name].quantity += item.quantity
            productMap[name].revenue += item.quantity * item.price
          })
        })
        const topProducts = Object.values(productMap)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)

        // En çok sipariş alan garsonlar
        const waiterMap = {}
        orders.forEach(order => {
          const name = order.users?.full_name || 'Bilinmeyen'
          if (!waiterMap[name]) {
            waiterMap[name] = { name, orders: 0, revenue: 0 }
          }
          waiterMap[name].orders += 1
          waiterMap[name].revenue += order.total_amount || 0
        })
        const topWaiters = Object.values(waiterMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        // Saatlik veri
        const hourlyMap = {}
        orders.forEach(order => {
          const hour = new Date(order.created_at).getHours()
          if (!hourlyMap[hour]) {
            hourlyMap[hour] = { hour, orders: 0, revenue: 0 }
          }
          hourlyMap[hour].orders += 1
          hourlyMap[hour].revenue += order.total_amount || 0
        })
        const hourlyData = Object.values(hourlyMap).sort((a, b) => a.hour - b.hour)

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          avgOrderValue,
          topProducts,
          topWaiters,
          hourlyData
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    const csvContent = [
      ['Rapor Tarihi', new Date().toLocaleString('tr-TR')],
      ['Dönem', dateRange === 'custom' ? `${customStartDate} - ${customEndDate}` : dateRange],
      [],
      ['Toplam Gelir', stats.totalRevenue.toFixed(2)],
      ['Toplam Sipariş', stats.totalOrders],
      ['Ortalama Sipariş', stats.avgOrderValue.toFixed(2)],
      [],
      ['En Çok Satan Ürünler'],
      ['Ürün', 'Adet', 'Gelir'],
      ...stats.topProducts.map(p => [p.name, p.quantity, p.revenue.toFixed(2)]),
      [],
      ['En İyi Garsonlar'],
      ['Garson', 'Sipariş', 'Gelir'],
      ...stats.topWaiters.map(w => [w.name, w.orders, w.revenue.toFixed(2)])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapor-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Satış Raporları</h1>
              <p className="text-sm text-gray-600">Detaylı satış analizi ve istatistikler</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              CSV İndir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tarih Seçimi */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Dönem Seçimi</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'today', label: 'Bugün' },
              { value: 'yesterday', label: 'Dün' },
              { value: 'week', label: 'Son 7 Gün' },
              { value: 'month', label: 'Son 30 Gün' },
              { value: 'custom', label: 'Özel Tarih' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-4">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.avgOrderValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* En Çok Satan Ürünler */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">En Çok Satan Ürünler</h3>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} adet</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(product.revenue)}</span>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">Veri bulunamadı</p>
              )}
            </div>
          </div>

          {/* En İyi Garsonlar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">En İyi Garsonlar</h3>
            <div className="space-y-3">
              {stats.topWaiters.map((waiter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{waiter.name}</p>
                      <p className="text-sm text-gray-600">{waiter.orders} sipariş</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(waiter.revenue)}</span>
                </div>
              ))}
              {stats.topWaiters.length === 0 && (
                <p className="text-center text-gray-500 py-8">Veri bulunamadı</p>
              )}
            </div>
          </div>
        </div>

        {/* Saatlik Dağılım */}
        {stats.hourlyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Saatlik Sipariş Dağılımı</h3>
            <div className="space-y-2">
              {stats.hourlyData.map(data => (
                <div key={data.hour} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-16">
                    {data.hour}:00
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full flex items-center justify-end px-3"
                      style={{
                        width: `${(data.orders / Math.max(...stats.hourlyData.map(d => d.orders))) * 100}%`
                      }}
                    >
                      <span className="text-sm font-bold text-white">
                        {data.orders} sipariş
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {formatPrice(data.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
