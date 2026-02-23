'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, Package, AlertTriangle, Plus, Minus, Edit2, History } from 'lucide-react'
import Link from 'next/link'

export default function StockPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [movementType, setMovementType] = useState('IN')
  const [movementQuantity, setMovementQuantity] = useState('')
  const [movementNotes, setMovementNotes] = useState('')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [movements, setMovements] = useState([])

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
      loadData(restaurantData.id)
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
    }
  }

  const loadData = async (restaurantId) => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('category_id', supabase.from('categories').select('id').eq('restaurant_id', restaurantId))
        .order('name')

      // Daha iyi bir sorgu
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', restaurantId)

      if (categoriesData) {
        const categoryIds = categoriesData.map(c => c.id)
        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            categories (name)
          `)
          .in('category_id', categoryIds)
          .order('name')

        if (productsData) {
          setProducts(productsData)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStockEnabled = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_enabled: !product.stock_enabled })
        .eq('id', product.id)

      if (error) throw error

      loadData(restaurant?.id || getAuthUser().restaurant_id)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const openMovementModal = (product, type) => {
    setSelectedProduct(product)
    setMovementType(type)
    setMovementQuantity('')
    setMovementNotes('')
    setShowMovementModal(true)
  }

  const handleMovement = async () => {
    if (!selectedProduct || !movementQuantity) return

    const user = getAuthUser()
    const quantity = parseInt(movementQuantity)
    const previousQuantity = selectedProduct.stock_quantity || 0
    let newQuantity = previousQuantity

    if (movementType === 'IN') {
      newQuantity = previousQuantity + quantity
    } else if (movementType === 'OUT') {
      newQuantity = Math.max(0, previousQuantity - quantity)
    } else if (movementType === 'ADJUSTMENT') {
      newQuantity = quantity
    }

    try {
      // Stok güncelle
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', selectedProduct.id)

      if (updateError) throw updateError

      // Hareket kaydet
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct.id,
          restaurant_id: restaurant?.id || user.restaurant_id,
          user_id: user.id,
          movement_type: movementType,
          quantity: Math.abs(quantity),
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          notes: movementNotes
        })

      if (movementError) throw movementError

      setShowMovementModal(false)
      loadData(restaurant?.id || user.restaurant_id)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const loadHistory = async (product) => {
    try {
      const { data } = await supabase
        .from('stock_movements')
        .select(`
          *,
          users (full_name)
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setMovements(data)
        setSelectedProduct(product)
        setShowHistoryModal(true)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const lowStockProducts = products.filter(p => 
    p.stock_enabled && p.stock_quantity <= p.low_stock_threshold
  )

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
              <h1 className="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
              <p className="text-sm text-gray-600">Ürün stok takibi ve yönetimi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Düşük Stok Uyarısı */}
        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Düşük Stok Uyarısı</p>
                <p className="text-sm text-yellow-700">
                  {lowStockProducts.length} ürünün stoğu azalmış
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ürünler */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok Takibi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mevcut Stok</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Eşik</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => {
                  const isLowStock = product.stock_enabled && product.stock_quantity <= product.low_stock_threshold
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {isLowStock && (
                              <p className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Düşük stok
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.categories?.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleStockEnabled(product)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock_enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.stock_enabled ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.stock_enabled ? (
                          <span className={`text-lg font-bold ${
                            isLowStock ? 'text-yellow-600' : 'text-gray-900'
                          }`}>
                            {product.stock_quantity || 0}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {product.stock_enabled ? product.low_stock_threshold : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {product.stock_enabled && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openMovementModal(product, 'IN')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Stok Giriş"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openMovementModal(product, 'OUT')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Stok Çıkış"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openMovementModal(product, 'ADJUSTMENT')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Düzeltme"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => loadHistory(product)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="Geçmiş"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stok Hareket Modalı */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {movementType === 'IN' && 'Stok Giriş'}
              {movementType === 'OUT' && 'Stok Çıkış'}
              {movementType === 'ADJUSTMENT' && 'Stok Düzeltme'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500">
                Mevcut Stok: <span className="font-bold">{selectedProduct.stock_quantity || 0}</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {movementType === 'ADJUSTMENT' ? 'Yeni Miktar' : 'Miktar'}
                </label>
                <input
                  type="number"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not (Opsiyonel)
                </label>
                <textarea
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Açıklama..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMovementModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleMovement}
                disabled={!movementQuantity}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Geçmiş Modalı */}
      {showHistoryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Stok Hareketleri</h3>
            <p className="text-gray-600 mb-4">{selectedProduct.name}</p>

            <div className="space-y-3">
              {movements.map(movement => (
                <div key={movement.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.movement_type === 'IN' ? 'bg-green-100 text-green-800' :
                        movement.movement_type === 'OUT' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.movement_type === 'IN' && '+ Giriş'}
                        {movement.movement_type === 'OUT' && '- Çıkış'}
                        {movement.movement_type === 'ADJUSTMENT' && '✎ Düzeltme'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {movement.users?.full_name || 'Bilinmeyen'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(movement.created_at).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {movement.previous_quantity} → {movement.new_quantity}
                      </p>
                    </div>
                  </div>
                  {movement.notes && (
                    <p className="text-sm text-gray-600 italic">{movement.notes}</p>
                  )}
                </div>
              ))}
              {movements.length === 0 && (
                <p className="text-center text-gray-500 py-8">Henüz hareket yok</p>
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-6 px-4 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
