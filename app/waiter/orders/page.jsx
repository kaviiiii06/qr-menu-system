'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, clearAuthUser, isWaiter } from '@/lib/auth'
import { ShoppingCart, Plus, Minus, LogOut, Check, Clock, Trash2, Eye, ArrowRightLeft, DoorClosed } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { auditLog } from '@/lib/auditLog'

export default function WaiterOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeOrders, setActiveOrders] = useState([])
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [editingItems, setEditingItems] = useState([])
  const [itemNotes, setItemNotes] = useState({})
  const [movingOrder, setMovingOrder] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    // Mobil tarayıcılar için küçük bir gecikme ekle
    const checkAuth = () => {
      const authUser = getAuthUser()
      if (!authUser || !isWaiter(authUser)) {
        router.push('/waiter')
        return
      }
      
      setUser(authUser)
      setIsCheckingAuth(false)
      loadTables(authUser.restaurant_id)
      loadCategories(authUser.restaurant_id)
      loadActiveOrders(authUser.restaurant_id)
      
      // Her 30 saniyede bir siparişleri güncelle
      const interval = setInterval(() => {
        loadActiveOrders(authUser.restaurant_id)
      }, 30000)
      
      return () => clearInterval(interval)
    }

    // Mobil için setTimeout ekle
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const loadTables = async (restaurantId) => {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number')
    
    if (data) setTables(data)
  }

  const loadCategories = async (restaurantId) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order')
    
    if (data) {
      setCategories(data)
      if (data.length > 0) {
        setSelectedCategory(data[0].id)
        loadProducts(data[0].id)
      }
    }
  }

  const loadProducts = async (categoryId) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
    
    if (data) setProducts(data)
  }

  const loadActiveOrders = async (restaurantId) => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        tables(table_number),
        users(full_name)
      `)
      .eq('restaurant_id', restaurantId)
      .in('status', ['PENDING', 'PREPARING', 'READY'])
      .order('created_at', { ascending: false })
    
    if (data) setActiveOrders(data)
  }

  const loadOrderDetails = async (orderId) => {
    const { data } = await supabase
      .from('order_items')
      .select(`
        *,
        products(name, price)
      `)
      .eq('order_id', orderId)
    
    if (data) {
      setSelectedOrderDetails(data)
      setEditingOrderId(null)
      setEditingItems([])
      setHasUnsavedChanges(false)
      // Not'ları state'e yükle
      const notes = {}
      data.forEach(item => {
        notes[item.id] = item.notes || ''
      })
      setItemNotes(notes)
    }
  }

  const startEditing = () => {
    setEditingOrderId(selectedOrderDetails[0].order_id)
    // Mevcut item'ları kopyala
    setEditingItems(selectedOrderDetails.map(item => ({
      ...item,
      originalQuantity: item.quantity,
      isDeleted: false
    })))
    setHasUnsavedChanges(false)
  }

  const cancelEditing = () => {
    if (hasUnsavedChanges && !confirm('Kaydedilmemiş değişiklikler var. İptal etmek istediğinizden emin misiniz?')) {
      return
    }
    setEditingOrderId(null)
    setEditingItems([])
    setHasUnsavedChanges(false)
  }

  const updateEditingItem = (itemId, field, value) => {
    setEditingItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
    setHasUnsavedChanges(true)
  }

  const deleteEditingItem = (itemId) => {
    setEditingItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isDeleted: true } : item
      )
    )
    setHasUnsavedChanges(true)
  }

  const saveAllChanges = async () => {
    if (!editingItems.length) return

    setIsLoading(true)
    try {
      const orderId = selectedOrderDetails[0].order_id

      // Silinen item'ları sil
      for (const item of editingItems.filter(i => i.isDeleted)) {
        const { error } = await supabase
          .from('order_items')
          .delete()
          .eq('id', item.id)
        
        if (error) throw error

        // Audit log
        auditLog.orderItemDeleted(user, user.restaurant_id, item.id, {
          product_name: item.products?.name,
          quantity: item.originalQuantity,
          price: item.price
        })
      }

      // Güncellenen item'ları güncelle
      for (const item of editingItems.filter(i => !i.isDeleted)) {
        const { error } = await supabase
          .from('order_items')
          .update({
            quantity: item.quantity,
            notes: itemNotes[item.id] || ''
          })
          .eq('id', item.id)
        
        if (error) throw error

        // Audit log (sadece miktar değiştiyse)
        if (item.quantity !== item.originalQuantity) {
          auditLog.orderItemUpdated(user, user.restaurant_id, item.id, {
            product_name: item.products?.name,
            quantity: item.originalQuantity,
            price: item.price
          }, {
            product_name: item.products?.name,
            quantity: item.quantity,
            price: item.price
          })
        }
      }

      // Toplam tutarı güncelle
      await updateOrderTotal(orderId)

      // Yenile
      await loadOrderDetails(orderId)
      loadActiveOrders(user.restaurant_id)
      
      setEditingOrderId(null)
      setEditingItems([])
      setHasUnsavedChanges(false)
      alert('Değişiklikler kaydedildi!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Kaydetme hatası: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProductToOrder = async (product) => {
    if (!selectedOrderDetails || selectedOrderDetails.length === 0) return
    
    const orderId = selectedOrderDetails[0].order_id
    
    const { data, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        product_id: product.id,
        quantity: 1,
        price: product.price,
        notes: ''
      })
      .select()
      .single()
    
    if (error) {
      alert('Hata: ' + error.message)
      return
    }
    
    // Audit log
    if (data) {
      auditLog.orderItemAdded(user, user.restaurant_id, data.id, {
        product_name: product.name,
        quantity: 1,
        price: product.price
      })
    }
    
    await loadOrderDetails(orderId)
    await updateOrderTotal(orderId)
    loadActiveOrders(user.restaurant_id)
  }

  const handleUpdateItemQuantity = async (itemId, newQuantity, notes = null) => {
    try {
      // Item bilgilerini al (log için)
      const item = selectedOrderDetails.find(i => i.id === itemId)
      
      if (newQuantity <= 0) {
        // Ürünü sil - daha agresif yaklaşım
        console.log('Deleting item:', itemId)
        
        const { error, data } = await supabase
          .from('order_items')
          .delete()
          .eq('id', itemId)
          .select()
        
        console.log('Delete result:', { error, data })
        
        if (error) {
          console.error('Delete error:', error)
          alert('Silme hatası: ' + error.message)
          return
        }
        
        // Audit log
        if (item) {
          auditLog.orderItemDeleted(user, user.restaurant_id, itemId, {
            product_name: item.products?.name,
            quantity: item.quantity,
            price: item.price
          })
        }
        
        alert('Ürün silindi!')
      } else {
        // Miktarı ve notu güncelle
        const updateData = { quantity: newQuantity }
        if (notes !== null) {
          updateData.notes = notes
        }
        
        console.log('Updating item:', itemId, updateData)
        
        const { error } = await supabase
          .from('order_items')
          .update(updateData)
          .eq('id', itemId)
        
        if (error) {
          console.error('Update error:', error)
          alert('Güncelleme hatası: ' + error.message)
          return
        }

        // Audit log
        if (item && item.quantity !== newQuantity) {
          auditLog.orderItemUpdated(user, user.restaurant_id, itemId, {
            product_name: item.products?.name,
            quantity: item.quantity,
            price: item.price
          }, {
            product_name: item.products?.name,
            quantity: newQuantity,
            price: item.price
          })
        }
      }

      // Siparişi yeniden yükle
      const orderId = selectedOrderDetails[0].order_id
      await loadOrderDetails(orderId)
      
      // Toplam tutarı güncelle
      await updateOrderTotal(orderId)
      
      // Aktif siparişleri yenile
      loadActiveOrders(user.restaurant_id)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Beklenmeyen hata: ' + error.message)
    }
  }

  const updateOrderTotal = async (orderId) => {
    const { data } = await supabase
      .from('order_items')
      .select('quantity, price')
      .eq('order_id', orderId)
    
    if (data) {
      const total = data.reduce((sum, item) => sum + (item.quantity * item.price), 0)
      await supabase
        .from('orders')
        .update({ total_amount: total })
        .eq('id', orderId)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    loadProducts(categoryId)
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId)
    if (existing.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTimeSince = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk önce`
    const hours = Math.floor(minutes / 60)
    return `${hours} saat ${minutes % 60} dk önce`
  }

  const handleSubmitOrder = async () => {
    if (!selectedTable || cart.length === 0) return

    setIsLoading(true)

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: user.restaurant_id,
          table_id: selectedTable,
          waiter_id: user.id,
          total_amount: getTotalAmount(),
          status: 'PENDING'
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setCart([])
      loadActiveOrders(user.restaurant_id)
      alert('Sipariş başarıyla oluşturuldu!')
    } catch (error) {
      console.error('Order error:', error)
      alert('Sipariş oluşturulurken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return

    try {
      console.log('Deleting order:', orderId)
      
      // Sipariş bilgilerini al (log için)
      const order = activeOrders.find(o => o.id === orderId)
      
      const { error, data } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select()

      console.log('Delete order result:', { error, data })

      if (error) {
        console.error('Delete order error:', error)
        alert('Sipariş silme hatası: ' + error.message)
        return
      }

      // Audit log
      if (order) {
        auditLog.orderDeleted(user, user.restaurant_id, orderId, {
          table_number: order.tables?.table_number,
          total_amount: order.total_amount
        })
      }

      loadActiveOrders(user.restaurant_id)
      alert('Sipariş silindi')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Beklenmeyen hata: ' + error.message)
    }
  }

  const handleCloseTable = async (order) => {
    if (!confirm(`Masa ${tables.find(t => t.id === order.table_id)?.table_number} kapatılsın mı? (Ödeme alındı olarak işaretlenecek)`)) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'PAID' })
        .eq('id', order.id)

      if (error) throw error

      // Audit log
      const tableNumber = tables.find(t => t.id === order.table_id)?.table_number
      auditLog.orderClosed(user, user.restaurant_id, order.id, {
        table_number: tableNumber,
        total_amount: order.total_amount
      })

      loadActiveOrders(user.restaurant_id)
      alert('Masa kapatıldı!')
    } catch (error) {
      alert('Hata oluştu: ' + error.message)
    }
  }

  const handleMoveOrder = async (newTableId) => {
    if (!movingOrder) return

    try {
      const fromTable = tables.find(t => t.id === movingOrder.table_id)?.table_number
      const toTable = tables.find(t => t.id === newTableId)?.table_number

      const { error } = await supabase
        .from('orders')
        .update({ table_id: newTableId })
        .eq('id', movingOrder.id)

      if (error) throw error

      // Audit log
      auditLog.orderMoved(user, user.restaurant_id, movingOrder.id, fromTable, toTable)

      setMovingOrder(null)
      loadActiveOrders(user.restaurant_id)
      alert('Sipariş taşındı!')
    } catch (error) {
      alert('Hata oluştu: ' + error.message)
    }
  }

  const handleLogout = () => {
    // Audit log
    if (user && user.restaurant_id) {
      auditLog.userLogout(user, user.restaurant_id)
    }
    
    clearAuthUser()
    router.push('/')
  }

  if (!user || isCheckingAuth) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      PREPARING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
      READY: { label: 'Hazır', color: 'bg-green-100 text-green-800' },
    }
    return badges[status] || badges.PENDING
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="text-sm text-gray-600">Hoş geldin, {user.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Çıkış
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Aktif Siparişler */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Aktif Siparişler ({activeOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => {
              const badge = getStatusBadge(order.status)
              return (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">Masa {order.tables?.table_number}</h3>
                      <p className="text-sm text-gray-600">{order.users?.full_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    {getTimeSince(order.created_at)}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold text-primary">{formatPrice(order.total_amount)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadOrderDetails(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Detayları Gör / Düzenle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setMovingOrder(order)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Masa Taşı"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCloseTable(order)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Masa Kapat (Ödendi)"
                      >
                        <DoorClosed className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {activeOrders.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Aktif sipariş bulunmuyor
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel - Ürünler */}
          <div className="lg:col-span-2 space-y-4">
            {/* Masa Seçimi */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold mb-3">
                {selectedTable ? `Seçili Masa: ${tables.find(t => t.id === selectedTable)?.table_number}` : 'Masa Seç'}
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      selectedTable === table.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {table.table_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategoriler */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ürünler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Panel - Sepet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Yeni Sipariş</h2>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sepet boş</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Toplam:</span>
                      <span className="text-primary">{formatPrice(getTotalAmount())}</span>
                    </div>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={!selectedTable || isLoading}
                      className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Siparişi Gönder
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sipariş Detay/Düzenleme Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Sipariş Detayları</h3>
              <div className="flex gap-2">
                {editingOrderId && hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 self-center">Kaydedilmemiş değişiklikler</span>
                )}
                {!editingOrderId ? (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1 rounded-lg text-sm font-semibold bg-primary text-white"
                  >
                    Düzenle
                  </button>
                ) : (
                  <>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      onClick={saveAllChanges}
                      disabled={!hasUnsavedChanges || isLoading}
                      className="px-3 py-1 rounded-lg text-sm font-semibold bg-green-600 text-white disabled:opacity-50"
                    >
                      {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {editingOrderId ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sol: Mevcut Ürünler */}
                <div>
                  <h4 className="font-semibold mb-3">Siparişteki Ürünler</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {editingItems.filter(i => !i.isDeleted).map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.products?.name}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateEditingItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              className="p-1 bg-white rounded hover:bg-gray-200"
                              title="Azalt"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateEditingItem(item.id, 'quantity', item.quantity + 1)}
                              className="p-1 bg-white rounded hover:bg-gray-200"
                              title="Artır"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                                  deleteEditingItem(item.id)
                                }
                              }}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={itemNotes[item.id] || ''}
                          onChange={(e) => {
                            setItemNotes({...itemNotes, [item.id]: e.target.value})
                            setHasUnsavedChanges(true)
                          }}
                          placeholder="Not ekle (ör: az acılı, soğansız)"
                          className="w-full text-sm px-2 py-1 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sağ: Ürün Ekle */}
                <div>
                  <h4 className="font-semibold mb-3">Ürün Ekle</h4>
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id)
                            loadProducts(category.id)
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ${
                            selectedCategory === category.id ? 'bg-primary text-white' : 'bg-gray-100'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                        </div>
                        <button
                          onClick={() => handleAddProductToOrder(product)}
                          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedOrderDetails.map(item => (
                  <div key={item.id} className="py-2 border-b">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-gray-600">x{item.quantity} • {formatPrice(item.price)}</p>
                        {item.notes && <p className="text-sm text-orange-600 italic">Not: {item.notes}</p>}
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t mb-4">
              <span className="font-bold">Toplam:</span>
              <span className="font-bold text-xl text-primary">
                {formatPrice(selectedOrderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedOrderDetails(null)
                setEditingOrderId(null)
              }}
              className="w-full py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Masa Taşıma Modal */}
      {movingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setMovingOrder(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">
              Masa Taşı - Masa {tables.find(t => t.id === movingOrder.table_id)?.table_number}
            </h3>
            <p className="text-gray-600 mb-4">Siparişi hangi masaya taşımak istiyorsunuz?</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {tables
                .filter(t => t.id !== movingOrder.table_id)
                .map(table => (
                  <button
                    key={table.id}
                    onClick={() => handleMoveOrder(table.id)}
                    className="p-4 bg-gray-100 hover:bg-primary hover:text-white rounded-lg font-semibold transition-all"
                  >
                    {table.table_number}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setMovingOrder(null)}
              className="w-full py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
