'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, ChefHat, Package, DollarSign } from 'lucide-react'
import { getAuthUser } from '@/lib/auth'
import { auditLog } from '@/lib/auditLog'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const authUser = getAuthUser()
    if (authUser) {
      setUser(authUser)
    }
    
    loadOrders()
    
    // Realtime subscription
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        tables (table_number),
        waiters (name),
        order_items (
          *,
          products (name, price)
        )
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setOrders(data)
    }
    
    setIsLoading(false)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    const oldStatus = order?.status

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      // Audit log
      if (user && order) {
        const statusLabels = {
          PENDING: 'Bekliyor',
          PREPARING: 'Hazırlanıyor',
          READY: 'Hazır',
          DELIVERED: 'Teslim Edildi',
          PAID: 'Ödendi'
        }
        
        auditLog.orderUpdated(user, order.restaurant_id, orderId, {
          status: oldStatus,
          table_number: order.tables?.table_number
        }, {
          status: newStatus,
          table_number: order.tables?.table_number
        })
      }
      
      loadOrders()
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: Clock,
      PREPARING: ChefHat,
      READY: Package,
      DELIVERED: CheckCircle,
      PAID: DollarSign
    }
    return icons[status] || Clock
  }

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Bekliyor',
      PREPARING: 'Hazırlanıyor',
      READY: 'Hazır',
      DELIVERED: 'Teslim Edildi',
      PAID: 'Ödendi'
    }
    return texts[status] || status
  }

  const filteredOrders = selectedStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const statusFilters = [
    { value: 'ALL', label: 'Tümü', count: orders.length },
    { value: 'PENDING', label: 'Bekliyor', count: orders.filter(o => o.status === 'PENDING').length },
    { value: 'PREPARING', label: 'Hazırlanıyor', count: orders.filter(o => o.status === 'PREPARING').length },
    { value: 'READY', label: 'Hazır', count: orders.filter(o => o.status === 'READY').length },
    { value: 'DELIVERED', label: 'Teslim Edildi', count: orders.filter(o => o.status === 'DELIVERED').length },
    { value: 'PAID', label: 'Ödendi', count: orders.filter(o => o.status === 'PAID').length }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-600 mt-1">Tüm siparişleri görüntüle ve yönet</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtreler */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedStatus === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Siparişler */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-500">Sipariş bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map(order => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Masa {order.tables?.table_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Garson: {order.waiters?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Ürünler */}
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.products?.name}
                        </span>
                        <span className="font-medium">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Toplam */}
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Toplam:</span>
                      <span className="text-primary">₺{order.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Durum Değiştirme Butonları */}
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
                      >
                        Hazırlanıyor
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                      >
                        Hazır
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600"
                      >
                        Teslim Edildi
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PAID')}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600"
                      >
                        Ödendi
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
