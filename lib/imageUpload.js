import { supabase } from './supabase'

/**
 * Resim dosyasını Supabase Storage'a yükler
 * @param {File} file - Yüklenecek dosya
 * @param {string} bucket - Storage bucket adı (varsayılan: 'product-images')
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export async function uploadImage(file, bucket = 'product-images') {
  try {
    // Dosya kontrolü
    if (!file) {
      return { url: null, error: 'Dosya seçilmedi' }
    }

    // Dosya tipi kontrolü
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return { url: null, error: 'Sadece resim dosyaları yüklenebilir (JPG, PNG, WebP, GIF)' }
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { url: null, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }
    }

    // Benzersiz dosya adı oluştur
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    // Dosyayı yükle
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: 'Yükleme hatası: ' + error.message }
    }

    // Public URL al
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, error: 'Beklenmeyen hata: ' + error.message }
  }
}

/**
 * Supabase Storage'dan resim siler
 * @param {string} imageUrl - Silinecek resmin URL'i
 * @param {string} bucket - Storage bucket adı
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteImage(imageUrl, bucket = 'product-images') {
  try {
    if (!imageUrl) return { success: true, error: null }

    // URL'den dosya yolunu çıkar
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }
}
