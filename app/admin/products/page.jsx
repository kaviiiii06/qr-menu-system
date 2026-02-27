'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, Save, Image as ImageIcon, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { formatPrice } from '@/lib/utils'
import { uploadImage, deleteImage } from '@/lib/imageUpload'

// ProductForm component'ini dışarı çıkarıyoruz
function ProductForm({ formData, setFormData, categories, onSave, onCancel, isEdit = false, onImageUpload, isUploading }) {
  const fileInputRef = React.useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ürün adı *"
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="Fiyat (TL) *"
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <select
        value={formData.category_id}
        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">Kategori seçin *</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Açıklama (opsiyonel)"
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      {/* Resim Yükleme Bölümü */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Ürün Resmi</label>
        
        {formData.image_url ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={formData.image_url}
              alt="Ürün resmi"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-image.png'
              }}
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, image_url: '' })}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Resmi kaldır"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-gray-600">Yükleniyor...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Bilgisayardan Resim Yükle</span>
                  <span className="text-xs text-gray-500">JPG, PNG, WebP, GIF (Max 5MB)</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.is_available}
          onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
          className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm font-medium text-gray-700">Stokta mevcut</span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={isUploading}
          className="flex-1 bg-primary text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isEdit ? 'Güncelle' : 'Kaydet'}
        </button>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          İptal
        </button>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
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

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order')

      setCategories(categoriesData || [])

      // Ürünleri getir - kategori olsun olmasın
      let productsQuery = supabase
        .from('products')
        .select('*, category:categories(name)')

      // Eğer kategori varsa filtrele
      if (categoriesData && categoriesData.length > 0) {
        productsQuery = productsQuery.in(
          'category_id',
          categoriesData.map((c) => c.id)
        )
      }

      const { data: productsData, error } = await productsQuery.order('name')

      if (error) throw error
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      setToast({ message: 'Lütfen tüm alanları doldurun!', type: 'error' })
      return
    }

    try {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
      })

      if (error) throw error

      setToast({ message: 'Ürün eklendi!', type: 'success' })
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_available: true,
      })
      setIsAdding(false)
      fetchData(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const handleImageUpload = async (file) => {
    setIsUploading(true)
    try {
      const { url, error } = await uploadImage(file)
      
      if (error) {
        setToast({ message: error, type: 'error' })
        return
      }

      setFormData({ ...formData, image_url: url })
      setToast({ message: 'Resim yüklendi!', type: 'success' })
    } catch (error) {
      setToast({ message: 'Resim yüklenirken hata oluştu!', type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (id) => {
    try {
      const updatedProduct = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
      }

      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', id)

      if (error) throw error

      // State'i güncelle
      setProducts(
        products.map((prod) =>
          prod.id === id
            ? {
                ...prod,
                ...updatedProduct,
                category: categories.find((c) => c.id === formData.category_id),
              }
            : prod
        )
      )

      setToast({ message: 'Ürün güncellendi!', type: 'success' })
      setEditingId(null)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error

      setToast({ message: 'Ürün silindi!', type: 'success' })
      fetchData(restaurant.id)
    } catch (error) {
      setToast({ message: 'Hata oluştu!', type: 'error' })
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_available: product.is_available,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
                <p className="text-sm text-gray-600">{products.length} ürün</p>
              </div>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Ürün
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary">
            <h3 className="font-bold text-lg mb-4">Yeni Ürün Ekle</h3>
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              onSave={handleAdd}
              onCancel={() => {
                setIsAdding(false)
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category_id: '',
                  image_url: '',
                  is_available: true,
                })
              }}
              onImageUpload={handleImageUpload}
              isUploading={isUploading}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {editingId === product.id ? (
                <div className="p-6">
                  <ProductForm
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    onSave={() => handleUpdate(product.id)}
                    onCancel={() => setEditingId(null)}
                    onImageUpload={handleImageUpload}
                    isUploading={isUploading}
                    isEdit
                  />
                </div>
              ) : (
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category?.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.is_available ? 'Stokta' : 'Stokta Yok'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Henüz ürün eklenmemiş.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
