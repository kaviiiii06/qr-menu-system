'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager, hashPassword } from '@/lib/auth'
import { Plus, Edit2, Trash2, UserCheck, UserX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function AdminWaitersPage() {
  const router = useRouter()
  const [waiters, setWaiters] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWaiter, setEditingWaiter] = useState(null)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    is_active: true,
  })

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
        alert('Kullanıcı bir işletmeye bağlı değil.')
        router.push('/')
        return
      }
      loadWaiters(user.restaurant_id)
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
        alert('Henüz işletme eklenmemiş!')
        router.push('/owner')
        return
      }

      setRestaurant(restaurantData)
      loadWaiters(restaurantData.id)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const loadWaiters = async (restaurantId) => {
    try {
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      setRestaurant(restaurantData)

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('role', 'WAITER')
        .order('created_at', { ascending: false })

      if (data) setWaiters(data)
    } catch (error) {
      console.error('Error loading waiters:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.full_name || !formData.username) {
      setToast({ message: 'Lütfen tüm alanları doldurun!', type: 'error' })
      return
    }

    if (!editingWaiter && !formData.password) {
      setToast({ message: 'Şifre gerekli!', type: 'error' })
      return
    }

    try {
      if (editingWaiter) {
        // Güncelleme
        const updateData = {
          full_name: formData.full_name,
          username: formData.username,
          is_active: formData.is_active,
        }

        // Eğer şifre değiştiriliyorsa
        if (formData.password) {
          updateData.password_hash = hashPassword(formData.password)
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingWaiter.id)

        if (error) throw error

        setToast({ message: 'Garson güncellendi!', type: 'success' })
      } else {
        // Yeni ekleme
        const { error } = await supabase.from('users').insert([
          {
            full_name: formData.full_name,
            username: formData.username,
            password_hash: hashPassword(formData.password),
            role: 'WAITER',
            restaurant_id: restaurant.id,
            is_active: formData.is_active,
          },
        ])

        if (error) throw error

        setToast({ message: 'Garson eklendi!', type: 'success' })
      }

      loadWaiters(restaurant.id)
      closeModal()
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Hata oluştu: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu garsonu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase.from('users').delete().eq('id', id)

      if (error) throw error

      setToast({ message: 'Garson silindi!', type: 'success' })
      loadWaiters(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const toggleActive = async (waiter) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !waiter.is_active })
        .eq('id', waiter.id)

      if (error) throw error

      loadWaiters(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const openModal = (waiter = null) => {
    if (waiter) {
      setEditingWaiter(waiter)
      setFormData({
        full_name: waiter.full_name,
        username: waiter.username,
        password: '',
        is_active: waiter.is_active,
      })
    } else {
      setEditingWaiter(null)
      setFormData({
        full_name: '',
        username: '',
        password: '',
        is_active: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingWaiter(null)
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Garsonlar</h1>
                <p className="text-gray-600 mt-1">
                  {restaurant.name} - {waiters.length} garson
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Garson
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İsim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {waiters.map((waiter) => (
                <tr key={waiter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{waiter.full_name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{waiter.username}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(waiter)}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        waiter.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {waiter.is_active ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          Pasif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(waiter)}
                      className="text-blue-600 hover:text-blue-800 mr-3 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(waiter.id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {waiters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz garson eklenmemiş.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingWaiter ? 'Garson Düzenle' : 'Yeni Garson'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İsim Soyisim
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  placeholder="garson1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre {editingWaiter && '(Boş bırakın değiştirmek istemiyorsanız)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required={!editingWaiter}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-orange-700 font-semibold"
                >
                  {editingWaiter ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
