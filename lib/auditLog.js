import { supabase } from './supabase'

// Audit log kaydet
export async function logAction({
  restaurantId,
  userId,
  userName,
  userRole,
  action, // 'CREATE', 'UPDATE', 'DELETE', 'MOVE', etc.
  tableName, // 'orders', 'order_items', 'tables', etc.
  recordId,
  oldValues = null,
  newValues = null,
  details, // Human readable description
}) {
  try {
    // Entity type'ı table name'den çıkar
    const entityType = tableName?.toUpperCase().replace('_', ' ') || 'UNKNOWN'
    const entityName = details || recordId

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        restaurant_id: restaurantId,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        action,
        table_name: tableName,
        record_id: recordId,
        entity_type: entityType,
        entity_id: recordId,
        entity_name: entityName,
        old_values: oldValues,
        new_values: newValues,
        details,
        ip_address: null,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
      })

    if (error) {
      console.error('Audit log error:', error)
    }
  } catch (error) {
    console.error('Audit log exception:', error)
  }
}

// Önceden tanımlanmış log fonksiyonları
export const auditLog = {
  // Sipariş işlemleri
  orderCreated: (user, restaurantId, orderId, orderData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'orders',
      recordId: orderId,
      newValues: orderData,
      details: `${user.full_name} yeni sipariş oluşturdu (Masa ${orderData.table_number})`
    })
  },

  orderUpdated: (user, restaurantId, orderId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'orders',
      recordId: orderId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} siparişi güncelledi`
    })
  },

  orderDeleted: (user, restaurantId, orderId, orderData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'orders',
      recordId: orderId,
      oldValues: orderData,
      details: `${user.full_name} siparişi sildi (Masa ${orderData.table_number})`
    })
  },

  orderMoved: (user, restaurantId, orderId, fromTable, toTable) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'MOVE',
      tableName: 'orders',
      recordId: orderId,
      oldValues: { table_number: fromTable },
      newValues: { table_number: toTable },
      details: `${user.full_name} siparişi Masa ${fromTable}'dan Masa ${toTable}'ya taşıdı`
    })
  },

  orderClosed: (user, restaurantId, orderId, orderData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CLOSE',
      tableName: 'orders',
      recordId: orderId,
      oldValues: orderData,
      details: `${user.full_name} masayı kapattı (Masa ${orderData.table_number} - ${orderData.total_amount}₺)`
    })
  },

  // Sipariş item işlemleri
  orderItemAdded: (user, restaurantId, itemId, itemData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'order_items',
      recordId: itemId,
      newValues: itemData,
      details: `${user.full_name} siparişe ürün ekledi: ${itemData.product_name} (${itemData.quantity} adet)`
    })
  },

  orderItemUpdated: (user, restaurantId, itemId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'order_items',
      recordId: itemId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} ürünü güncelledi: ${newData.product_name} (${oldData.quantity} → ${newData.quantity} adet)`
    })
  },

  orderItemDeleted: (user, restaurantId, itemId, itemData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'order_items',
      recordId: itemId,
      oldValues: itemData,
      details: `${user.full_name} ürünü sildi: ${itemData.product_name} (${itemData.quantity} adet)`
    })
  },

  // Genel işlemler
  userLogin: (user, restaurantId) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      details: `${user.full_name} (${user.role}) sisteme giriş yaptı`
    })
  },

  userLogout: (user, restaurantId) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'LOGOUT',
      tableName: 'users',
      recordId: user.id,
      details: `${user.full_name} (${user.role}) sistemden çıkış yaptı`
    })
  },

  // Ürün işlemleri
  productCreated: (user, restaurantId, productId, productData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'products',
      recordId: productId,
      newValues: productData,
      details: `${user.full_name} yeni ürün ekledi: ${productData.name} (${productData.price}₺)`
    })
  },

  productUpdated: (user, restaurantId, productId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'products',
      recordId: productId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} ürünü güncelledi: ${newData.name}`
    })
  },

  productDeleted: (user, restaurantId, productId, productData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'products',
      recordId: productId,
      oldValues: productData,
      details: `${user.full_name} ürünü sildi: ${productData.name}`
    })
  },

  // Kategori işlemleri
  categoryCreated: (user, restaurantId, categoryId, categoryData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'categories',
      recordId: categoryId,
      newValues: categoryData,
      details: `${user.full_name} yeni kategori ekledi: ${categoryData.name}`
    })
  },

  categoryUpdated: (user, restaurantId, categoryId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'categories',
      recordId: categoryId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} kategoriyi güncelledi: ${newData.name}`
    })
  },

  categoryDeleted: (user, restaurantId, categoryId, categoryData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'categories',
      recordId: categoryId,
      oldValues: categoryData,
      details: `${user.full_name} kategoriyi sildi: ${categoryData.name}`
    })
  },

  // Masa işlemleri
  tableCreated: (user, restaurantId, tableId, tableData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'tables',
      recordId: tableId,
      newValues: tableData,
      details: `${user.full_name} yeni masa ekledi: Masa ${tableData.table_number}`
    })
  },

  tableUpdated: (user, restaurantId, tableId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'tables',
      recordId: tableId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} masayı güncelledi: Masa ${newData.table_number}`
    })
  },

  tableDeleted: (user, restaurantId, tableId, tableData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'tables',
      recordId: tableId,
      oldValues: tableData,
      details: `${user.full_name} masayı sildi: Masa ${tableData.table_number}`
    })
  },

  // Kullanıcı yönetimi işlemleri
  userCreated: (user, restaurantId, newUserId, newUserData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'CREATE',
      tableName: 'users',
      recordId: newUserId,
      newValues: newUserData,
      details: `${user.full_name} yeni kullanıcı ekledi: ${newUserData.full_name} (${newUserData.role})`
    })
  },

  userUpdated: (user, restaurantId, updatedUserId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'users',
      recordId: updatedUserId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} kullanıcıyı güncelledi: ${newData.full_name}`
    })
  },

  userDeleted: (user, restaurantId, deletedUserId, deletedUserData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DELETE',
      tableName: 'users',
      recordId: deletedUserId,
      oldValues: deletedUserData,
      details: `${user.full_name} kullanıcıyı sildi: ${deletedUserData.full_name}`
    })
  },

  // İşletme işlemleri
  restaurantUpdated: (user, restaurantId, oldData, newData) => {
    logAction({
      restaurantId,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'UPDATE',
      tableName: 'restaurants',
      recordId: restaurantId,
      oldValues: oldData,
      newValues: newData,
      details: `${user.full_name} işletme bilgilerini güncelledi: ${newData.name}`
    })
  }
}

// Log tiplerinin renkleri ve ikonları
export const logTypeConfig = {
  CREATE: { color: 'text-green-600 bg-green-50', icon: '➕', label: 'Oluşturuldu' },
  UPDATE: { color: 'text-blue-600 bg-blue-50', icon: '✏️', label: 'Güncellendi' },
  DELETE: { color: 'text-red-600 bg-red-50', icon: '🗑️', label: 'Silindi' },
  MOVE: { color: 'text-purple-600 bg-purple-50', icon: '↔️', label: 'Taşındı' },
  CLOSE: { color: 'text-orange-600 bg-orange-50', icon: '🚪', label: 'Kapatıldı' },
  LOGIN: { color: 'text-cyan-600 bg-cyan-50', icon: '🔑', label: 'Giriş' },
  LOGOUT: { color: 'text-gray-600 bg-gray-50', icon: '👋', label: 'Çıkış' },
}
