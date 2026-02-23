'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    todayOrders: 0,
    monthOrders: 0,
    activeOrders: 0,
  })
  const [activeOrders, setActiveOrders] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getAuthUser()
    if (!user || (!isManager(user) && user.role !== 'OWNER')) {
      router.push('/login?type=admin')
      return
    }

    let subscription = null

    if (user.role === 'OWNER') {
      fetchFirstRestaurant().then((restaurantId) => {
        if (restaurantId) {
          subscription = setupRealtimeSubscription(restaurantId)
        }
      })
    } else {
      if (!user.restaurant_id) {
        alert('Kullanıcı bir işletmeye bağlı değil.')
        router.push('/')
        return
      }
      loadDashboard(user.restaurant_id)
      subscription = setupRealtimeSubscription(user.restaurant_id)
    }

    return () => {
      if (subscription) {
        subscription()
      }
    }
  }, [router])

  const setupRealtimeSubscription = (restaurantId) => {
    console.log('Setting up realtime for restaurant:', restaurantId)
    
    // Siparişler tablosunu dinle
    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          console.log('🔔 Order changed:', payload.eventType, payload.new || payload.old)
          // Anlık güncelleme
          loadDashboard(restaurantId)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        (payload) => {
          console.log('🔔 Order item changed:', payload.eventType)
          // Anlık güncelleme
          loadDashboard(restaurantId)
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Unsubscribing from realtime')
      channel.unsubscribe()
    }
  }

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
        return null
      }

      setRestaurant(restaurantData)
      loadDashboard(restaurantData.id)
      return restaurantData.id
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
      return null
    }
  }

  const loadDashboard = async (restaurantId) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Bugünkü ciro ve sipariş sayısı
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', today.toISOString())
        .in('status', ['PAID', 'DELIVERED'])

      // Aylık ciro ve sipariş sayısı
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', firstDayOfMonth.toISOString())
        .in('status', ['PAID', 'DELIVERED'])

      // Aktif siparişler
      const { data: active } = await supabase
        .from('orders')
        .select(`
          *,
          tables(table_number),
          users(full_name)
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['PENDING', 'PREPARING', 'READY'])
        .order('created_at', { ascending: false })

      // Son siparişler
      const { data: recent } = await supabase
        .from('orders')
        .select(`
          *,
          tables(table_number),
          users(full_name)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        todayRevenue: todayOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0,
        monthRevenue: monthOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0,
        todayOrders: todayOrders?.length || 0,
        monthOrders: monthOrders?.length || 0,
        activeOrders: active?.length || 0,
      })

      setActiveOrders(active || [])
      setRecentOrders(recent || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrderDetails = async (orderId) => {
    const { data } = await supabase
      .from('order_items')
      .select(`
        *,
        products(name, price)
      `)
      .eq('order_id', orderId)
    
    if (data) setSelectedOrderDetails(data)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      if (restaurant) {
        loadDashboard(restaurant.id)
      }
    } catch (error) {
      alert('Hata oluştu: ' + error.message)
    }
  }

  const getTimeSince = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk önce`
    const hours = Math.floor(minutes / 60)
    return `${hours} saat ${minutes % 60} dk önce`
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      PREPARING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
      READY: { label: 'Hazır', color: 'bg-green-100 text-green-800' },
      DELIVERED: { label: 'Teslim Edildi', color: 'bg-purple-100 text-purple-800' },
      PAID: { label: 'Ödendi', color: 'bg-gray-100 text-gray-800' },
    }
    return badges[status] || badges.PENDING
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Sipariş ve ciro takibi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Bugünkü Ciro</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{formatPrice(stats.todayRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.todayOrders} sipariş</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Aylık Ciro</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{formatPrice(stats.monthRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.monthOrders} sipariş</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Aktif Siparişler</h3>
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.activeOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Bekleyen/Hazırlanan</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Ortalama Sipariş</h3>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {stats.todayOrders > 0 ? formatPrice(stats.todayRevenue / stats.todayOrders) : formatPrice(0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Bugün</p>
          </div>
        </div>

        {/* Aktif Siparişler */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Aktif Siparişler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => {
              const badge = getStatusBadge(order.status)
              return (
                <div key={order.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">Masa {order.tables?.table_number}</h3>
                      <p className="text-sm text-gray-600">{order.users?.full_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    {getTimeSince(order.created_at)}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold text-primary">{formatPrice(order.total_amount)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadOrderDetails(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Detayları Gör"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Hazırlanıyor"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Hazır"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Teslim Edildi"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {activeOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aktif sipariş bulunmuyor
            </div>
          )}
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Son Siparişler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garson</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zaman</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(order => {
                  const badge = getStatusBadge(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">Masa {order.tables?.table_number}</td>
                      <td className="px-4 py-3 text-gray-600">{order.users?.full_name}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{formatPrice(order.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getTimeSince(order.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => loadOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sipariş Detay Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrderDetails(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Sipariş Detayları</h3>
            <div className="space-y-2 mb-4">
              {selectedOrderDetails.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-gray-600">x{item.quantity} • {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t mb-4">
              <span className="font-bold">Toplam:</span>
              <span className="font-bold text-xl text-primary">
                {formatPrice(selectedOrderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </span>
            </div>
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
