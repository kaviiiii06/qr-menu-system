'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { ChefHat, Clock, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react'
import { playNotificationSound } from '@/lib/notification'

export default function KitchenPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const authUser = getAuthUser()
    if (!authUser) {
      router.push('/login?type=admin')
      return
    }
    setUser(authUser)
    loadOrders()
    
    // Realtime subscription
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change:', payload)
          loadOrders()
          if (payload.eventType === 'INSERT') {
            playNotificationSound()
          }
        }
      )
      .subscribe()

    // Auto refresh her 30 saniyede
    const interval = setInterval(() => {
      loadOrders()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        tables (table_number),
        users (full_name),
        order_items (
          *,
          products (name)
        )
      `)
      .in('status', ['PENDING', 'PREPARING'])
      .order('created_at', { ascending: true })

    if (data) {
      setOrders(data)
      setLastUpdate(new Date())
    }
    
    setIsLoading(false)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      loadOrders()
    }
  }

  const getTimeSince = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk`
    const hours = Math.floor(minutes / 60)
    return `${hours}s ${minutes % 60}dk`
  }

  const getTimeColor = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 10) return 'text-green-600'
    if (minutes < 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    router.push('/')
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const preparingOrders = orders.filter(o => o.status === 'PREPARING')

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold">Mutfak Ekranı</h1>
                <p className="text-sm text-gray-400">
                  {user.full_name} • Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadOrders}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <RefreshCw className="w-5 h-5" />
                Yenile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                <LogOut className="w-5 h-5" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bekleyen Siparişler */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold">
                Bekleyen ({pendingOrders.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  getTimeSince={getTimeSince}
                  getTimeColor={getTimeColor}
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
                  Bekleyen sipariş yok
                </div>
              )}
            </div>
          </div>

          {/* Hazırlanıyor */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold">
                Hazırlanıyor ({preparingOrders.length})
              </h2>
            </div>
            <div className="space-y-4">
              {preparingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  getTimeSince={getTimeSince}
                  getTimeColor={getTimeColor}
                />
              ))}
              {preparingOrders.length === 0 && (
                <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
                  Hazırlanan sipariş yok
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onStatusChange, getTimeSince, getTimeColor }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-3xl font-bold text-orange-500">
            Masa {order.tables?.table_number}
          </h3>
          <p className="text-sm text-gray-400">{order.users?.full_name}</p>
        </div>
        <div className={`text-right ${getTimeColor(order.created_at)}`}>
          <Clock className="w-5 h-5 inline mr-1" />
          <span className="text-lg font-bold">{getTimeSince(order.created_at)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.order_items?.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
            <div>
              <span className="text-2xl font-bold text-white mr-3">
                {item.quantity}x
              </span>
              <span className="text-lg text-gray-200">{item.products?.name}</span>
            </div>
            {item.notes && (
              <span className="text-sm text-yellow-400 italic">
                {item.notes}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === 'PENDING' && (
          <button
            onClick={() => onStatusChange(order.id, 'PREPARING')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            Hazırlamaya Başla
          </button>
        )}
        {order.status === 'PREPARING' && (
          <button
            onClick={() => onStatusChange(order.id, 'READY')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Hazır
          </button>
        )}
      </div>
    </div>
  )
}
