'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, DollarSign, CreditCard, Banknote, Wallet, TrendingUp, Calendar, Download } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function CashierPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [cashData, setCashData] = useState({
    openingBalance: 0,
    closingBalance: 0,
    totalCash: 0,
    totalCard: 0,
    totalRevenue: 0,
    orderCount: 0,
    orders: []
  })
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

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
  }, [router, selectedDate])

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

  const loadData = async (restaurantId) => {
    setIsLoading(true)

    try {
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      // Günün siparişlerini çek
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number),
          users (full_name)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'PAID')
        .order('created_at', { ascending: false })

      if (orders) {
        const totalCash = orders
          .filter(o => o.payment_method === 'CASH')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0)
        
        const totalCard = orders
          .filter(o => o.payment_method === 'CARD')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0)

        setCashData({
          openingBalance: 0, // TODO: Implement opening balance
          closingBalance: totalCash,
          totalCash,
          totalCard,
          totalRevenue: totalCash + totalCard,
          orderCount: orders.length,
          orders
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedOrder) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id)

      if (error) throw error

      setShowPaymentModal(false)
      setSelectedOrder(null)
      loadData(restaurant?.id || getAuthUser().restaurant_id)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const exportReport = () => {
    const csvContent = [
      ['Kasa Raporu', selectedDate],
      [],
      ['Açılış Kasası', cashData.openingBalance.toFixed(2)],
      ['Nakit Tahsilat', cashData.totalCash.toFixed(2)],
      ['Kredi Kartı', cashData.totalCard.toFixed(2)],
      ['Toplam Gelir', cashData.totalRevenue.toFixed(2)],
      ['Kapanış Kasası', cashData.closingBalance.toFixed(2)],
      ['Sipariş Sayısı', cashData.orderCount],
      [],
      ['Detaylı Siparişler'],
      ['Saat', 'Masa', 'Garson', 'Tutar', 'Ödeme'],
      ...cashData.orders.map(o => [
        new Date(o.created_at).toLocaleTimeString('tr-TR'),
        o.tables?.table_number || '-',
        o.users?.full_name || '-',
        o.total_amount.toFixed(2),
        o.payment_method === 'CASH' ? 'Nakit' : 'Kredi Kartı'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kasa-raporu-${selectedDate}.csv`
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
              <h1 className="text-2xl font-bold text-gray-900">Kasa Yönetimi</h1>
              <p className="text-sm text-gray-600">Günlük kasa raporu ve ödeme takibi</p>
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
            <h2 className="text-lg font-semibold">Tarih Seçimi</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Kasa Özeti */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Banknote className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Nakit</p>
                <p className="text-2xl font-bold">{formatPrice(cashData.totalCash)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Kredi Kartı</p>
                <p className="text-2xl font-bold">{formatPrice(cashData.totalCard)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Toplam Gelir</p>
                <p className="text-2xl font-bold">{formatPrice(cashData.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Sipariş Sayısı</p>
                <p className="text-2xl font-bold">{cashData.orderCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kasa Detayı */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Kasa Detayı</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Açılış Kasası</span>
              <span className="font-bold">{formatPrice(cashData.openingBalance)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Nakit Tahsilat</span>
              <span className="font-bold text-green-600">+{formatPrice(cashData.totalCash)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Kredi Kartı</span>
              <span className="font-bold text-blue-600">+{formatPrice(cashData.totalCard)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <span className="text-gray-900 font-semibold">Kapanış Kasası</span>
              <span className="font-bold text-purple-600 text-xl">{formatPrice(cashData.closingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Siparişler */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Günlük Siparişler ({cashData.orderCount})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garson</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cashData.orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Masa {order.tables?.table_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.users?.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.payment_method === 'CASH' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.payment_method === 'CASH' ? (
                          <>
                            <Banknote className="w-3 h-3 mr-1" />
                            Nakit
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3 mr-1" />
                            Kredi Kartı
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {cashData.orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Bu tarihte sipariş bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
