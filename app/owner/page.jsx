'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, clearAuthUser, isOwner, hashPassword } from '@/lib/auth'
import { Plus, Edit2, Trash2, LogOut, Store, Users, ShoppingBag } from 'lucide-react'

export default function OwnerPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    manager_username: '',
    manager_password: '',
    manager_fullname: ''
  })

  useEffect(() => {
    const authUser = getAuthUser()
    if (!authUser || !isOwner(authUser)) {
      router.push('/login?type=admin')
      return
    }
    setUser(authUser)
    loadRestaurants()
  }, [router])

  const loadRestaurants = async () => {
    try {
      setIsLoading(true)
      // Basit sorgu - sadece restaurant bilgileri
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!restaurantsData) return

      // Her restaurant için sayıları paralel yükle
      const restaurantsWithCounts = await Promise.all(
        restaurantsData.map(async (restaurant) => {
          const [tablesResult, usersResult] = await Promise.all([
            supabase.from('tables').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id)
          ])

          return {
            ...restaurant,
            tables: [{ count: tablesResult.count || 0 }],
            users: [{ count: usersResult.count || 0 }]
          }
        })
      )

      setRestaurants(restaurantsWithCounts)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingRestaurant) {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url
        })
        .eq('id', editingRestaurant.id)

      if (!error) {
        loadRestaurants()
        closeModal()
      }
    } else {
      // Yeni işletme ekle
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url
        }])
        .select()
        .single()

      if (restaurantError) {
        alert('Hata: ' + restaurantError.message)
        return
      }

      // Otomatik yönetici hesabı oluştur
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          username: formData.manager_username,
          password_hash: hashPassword(formData.manager_password),
          full_name: formData.manager_fullname,
          role: 'MANAGER',
          restaurant_id: restaurant.id,
          is_active: true
        }])

      if (userError) {
        alert('İşletme oluşturuldu ama yönetici hesabı oluşturulamadı: ' + userError.message)
      }

      loadRestaurants()
      closeModal()
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bu işletmeyi silmek istediğinizden emin misiniz? Tüm veriler silinecektir!')) {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)

      if (!error) loadRestaurants()
    }
  }

  const openModal = (restaurant = null) => {
    if (restaurant) {
      setEditingRestaurant(restaurant)
      setFormData({
        name: restaurant.name,
        slug: restaurant.slug,
        logo_url: restaurant.logo_url || '',
        manager_username: '',
        manager_password: '',
        manager_fullname: ''
      })
    } else {
      setEditingRestaurant(null)
      setFormData({
        name: '',
        slug: '',
        logo_url: '',
        manager_username: '',
        manager_password: '',
        manager_fullname: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRestaurant(null)
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kurucu Paneli</h1>
            <p className="text-gray-600 mt-1">Hoş geldin, {user.full_name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal()}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni İşletme
            </button>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz işletme eklenmemiş
            </h3>
            <p className="text-gray-600 mb-6">
              İlk işletmenizi ekleyerek başlayın
            </p>
            <button
              onClick={() => openModal()}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90"
            >
              İlk İşletmeyi Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">/{restaurant.slug}</p>
                  </div>
                  {restaurant.logo_url && (
                    <img 
                      src={restaurant.logo_url} 
                      alt={restaurant.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Store className="w-4 h-4" />
                    <span>{restaurant.tables?.[0]?.count || 0} Masa</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{restaurant.users?.[0]?.count || 0} Kullanıcı</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/owner/restaurant/${restaurant.id}`)}
                    className="flex-1 bg-primary/10 text-primary py-2 rounded-lg font-medium hover:bg-primary/20"
                  >
                    Yönet
                  </button>
                  <button
                    onClick={() => openModal(restaurant)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingRestaurant ? 'İşletme Düzenle' : 'Yeni İşletme'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İşletme Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug (benzersiz)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="ornek-restoran"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL (opsiyonel)
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              {!editingRestaurant && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Yönetici Hesabı</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yönetici Adı Soyadı
                    </label>
                    <input
                      type="text"
                      value={formData.manager_fullname}
                      onChange={(e) => setFormData({ ...formData, manager_fullname: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
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
                      value={formData.manager_username}
                      onChange={(e) => setFormData({ ...formData, manager_username: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="yonetici"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şifre
                    </label>
                    <input
                      type="password"
                      value={formData.manager_password}
                      onChange={(e) => setFormData({ ...formData, manager_password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingRestaurant ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
