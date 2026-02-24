'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, Plus, Trash2, Loader2, QrCode, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [tableNumber, setTableNumber] = useState('')

  useEffect(() => {
    const user = getAuthUser()
    if (!user || (!isManager(user) && user.role !== 'OWNER')) {
      router.push('/login?type=admin')
      return
    }
    
    // Owner ise ilk işletmeyi al, değilse kendi işletmesini kullan
    if (user.role === 'OWNER') {
      fetchFirstRestaurant()
    } else {
      if (!user.restaurant_id) {
        console.error('User has no restaurant_id:', user)
        alert('Kullanıcı bir işletmeye bağlı değil. Lütfen kurucu ile iletişime geçin.')
        router.push('/')
        return
      }
      fetchData(user.restaurant_id)
    }
  }, [router])

  const fetchFirstRestaurant = async () => {
    try {
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single()

      if (error || !restaurantData) {
        console.error('No restaurant found:', error)
        alert('Henüz işletme eklenmemiş!')
        router.push('/owner')
        return
      }

      fetchData(restaurantData.id)
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
    }
  }

  const fetchData = async (restaurantId) => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (restaurantError || !restaurantData) {
        console.error('Restaurant not found:', restaurantError)
        alert('İşletme bulunamadı!')
        router.push('/')
        return
      }

      setRestaurant(restaurantData)

      const { data: tablesData, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .order('table_number')

      if (error) throw error
      setTables(tablesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!tableNumber) return

    try {
      const { error } = await supabase.from('tables').insert({
        restaurant_id: restaurant.id,
        table_number: parseInt(tableNumber),
      })

      if (error) throw error

      setToast({ message: 'Masa eklendi!', type: 'success' })
      setTableNumber('')
      
      // restaurant.id'yi kullan
      const user = getAuthUser()
      if (user?.restaurant_id) {
        fetchData(user.restaurant_id)
      }
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase.from('tables').delete().eq('id', id)

      if (error) throw error

      setToast({ message: 'Masa silindi!', type: 'success' })
      
      // restaurant.id'yi kullan
      const user = getAuthUser()
      if (user?.restaurant_id) {
        fetchData(user.restaurant_id)
      }
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const getTableUrl = (tableId) => {
    if (typeof window === 'undefined') return ''
    if (!restaurant?.slug) return ''
    // Ensure we don't duplicate the origin
    return `${window.location.origin}/${restaurant.slug}/${tableId}`
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setToast({ message: 'URL kopyalandı!', type: 'success' })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      setToast({ message: 'Kopyalama başarısız!', type: 'error' })
    }
  }

  const openQRGenerator = (url) => {
    // Ensure URL is valid and doesn't have duplicates
    if (!url || url.includes('undefined')) {
      setToast({ message: 'Geçersiz URL!', type: 'error' })
      return
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    window.open(qrUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Masalar</h1>
              <p className="text-sm text-gray-600">{tables.length} masa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Add Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Yeni Masa Ekle</h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Masa numarası"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ekle
            </button>
          </div>
        </div>

        {/* Tables List */}
        <div className="space-y-4">
          {tables.map((table) => {
            const url = getTableUrl(table.id)
            return (
              <div
                key={table.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Masa {table.table_number}</h3>
                    <p className="text-xs text-gray-500 mt-1">ID: {table.id}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* URL */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Menü URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(url, table.id)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copiedId === table.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Button */}
                  <button
                    onClick={() => openQRGenerator(url)}
                    className="w-full bg-primary text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    QR Kod Oluştur
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {tables.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Henüz masa eklenmemiş.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
