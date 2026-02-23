'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, Calendar, Plus, Phone, Mail, Users, Clock, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ReservationsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guest_count: 2,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '19:00',
    table_id: '',
    notes: ''
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
      // Rezervasyonları çek
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          *,
          tables (table_number)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('reservation_date', selectedDate)
        .lte('reservation_date', selectedDate)
        .order('reservation_time')

      if (reservationsData) {
        setReservations(reservationsData)
      }

      // Masaları çek
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('table_number')

      if (tablesData) {
        setTables(tablesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = getAuthUser()
    const restaurantId = restaurant?.id || user.restaurant_id

    try {
      if (editingReservation) {
        // Güncelle
        const { error } = await supabase
          .from('reservations')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReservation.id)

        if (error) throw error
        alert('Rezervasyon güncellendi!')
      } else {
        // Yeni ekle
        const { error } = await supabase
          .from('reservations')
          .insert({
            ...formData,
            restaurant_id: restaurantId,
            created_by: user.id,
            status: 'CONFIRMED'
          })

        if (error) throw error
        alert('Rezervasyon oluşturuldu!')
      }

      setShowModal(false)
      setEditingReservation(null)
      resetForm()
      loadData(restaurantId)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      loadData(restaurant?.id || getAuthUser().restaurant_id)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      guest_count: 2,
      reservation_date: new Date().toISOString().split('T')[0],
      reservation_time: '19:00',
      table_id: '',
      notes: ''
    })
  }

  const openEditModal = (reservation) => {
    setEditingReservation(reservation)
    setFormData({
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone,
      customer_email: reservation.customer_email || '',
      guest_count: reservation.guest_count,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      table_id: reservation.table_id || '',
      notes: reservation.notes || ''
    })
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-800' },
      NO_SHOW: { label: 'Gelmedi', color: 'bg-gray-100 text-gray-800' },
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

  const statusCounts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
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
              <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
              <p className="text-sm text-gray-600">Masa rezervasyonlarını yönetin</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setEditingReservation(null)
                setShowModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Yeni Rezervasyon
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tarih Seçimi ve İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih Seç
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Toplam</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Bekliyor</p>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Onaylı</p>
            <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
          </div>
        </div>

        {/* Rezervasyon Listesi */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kişi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map(reservation => {
                  const badge = getStatusBadge(reservation.status)
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{reservation.reservation_time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{reservation.customer_name}</p>
                          {reservation.notes && (
                            <p className="text-sm text-gray-500">{reservation.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {reservation.customer_phone}
                          </div>
                          {reservation.customer_email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {reservation.customer_email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{reservation.guest_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.tables?.table_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'CONFIRMED')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Onayla"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'CANCELLED')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="İptal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(reservation)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Düzenle
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {reservations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Bu tarihte rezervasyon bulunamadı
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="Müşteri Adı *"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  placeholder="Telefon *"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  placeholder="Email"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({...formData, guest_count: parseInt(e.target.value)})}
                  placeholder="Kişi Sayısı *"
                  min="1"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={formData.reservation_date}
                  onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={formData.reservation_time}
                  onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={formData.table_id}
                  onChange={(e) => setFormData({...formData, table_id: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Masa Seç (Opsiyonel)</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Masa {table.table_number}
                    </option>
                  ))}
                </select>
              </div>
              
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Notlar"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingReservation(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingReservation ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
