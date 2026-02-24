'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { auditLog } from '@/lib/auditLog'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', sort_order: 0 })

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
      // Restoran bilgisi
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

      // Kategoriler
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    try {
      const user = getAuthUser()
      
      const { data, error } = await supabase.from('categories').insert({
        restaurant_id: restaurant.id,
        name: formData.name,
        sort_order: formData.sort_order || categories.length,
      }).select().single()

      if (error) throw error

      // Audit log
      if (user && data) {
        auditLog.categoryCreated(user, restaurant.id, data.id, {
          name: data.name,
          sort_order: data.sort_order
        })
      }

      setToast({ message: 'Kategori eklendi!', type: 'success' })
      setFormData({ name: '', sort_order: 0 })
      setIsAdding(false)
      fetchData(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const handleUpdate = async (id) => {
    try {
      const user = getAuthUser()
      const oldCategory = categories.find(cat => cat.id === id)
      
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          sort_order: formData.sort_order,
        })
        .eq('id', id)

      if (error) throw error

      // Audit log
      if (user && oldCategory) {
        auditLog.categoryUpdated(user, restaurant.id, id, 
          { name: oldCategory.name, sort_order: oldCategory.sort_order },
          { name: formData.name, sort_order: formData.sort_order }
        )
      }

      // State'i güncelle
      setCategories(
        categories.map((cat) =>
          cat.id === id
            ? { ...cat, name: formData.name, sort_order: formData.sort_order }
            : cat
        )
      )

      setToast({ message: 'Kategori güncellendi!', type: 'success' })
      setEditingId(null)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      const user = getAuthUser()
      const category = categories.find(cat => cat.id === id)
      
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) throw error

      // Audit log
      if (user && category) {
        auditLog.categoryDeleted(user, restaurant.id, id, {
          name: category.name,
          sort_order: category.sort_order
        })
      }

      setToast({ message: 'Kategori silindi!', type: 'success' })
      fetchData(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setFormData({ name: category.name, sort_order: category.sort_order })
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
                <p className="text-sm text-gray-600">{categories.length} kategori</p>
              </div>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Kategori
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary">
            <h3 className="font-bold text-lg mb-4">Yeni Kategori Ekle</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kategori adı"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                }
                placeholder="Sıra"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-primary text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Kaydet
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setFormData({ name: '', sort_order: 0 })
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
          >
            {editingId === category.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdate(category.id)}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">Sıra: {category.sort_order}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Henüz kategori eklenmemiş.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
