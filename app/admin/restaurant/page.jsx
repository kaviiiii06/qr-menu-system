'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
  })

  useEffect(() => {
    fetchRestaurant()
  }, [])

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single()

      if (error) throw error

      if (data) {
        setRestaurant(data)
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          logo_url: data.logo_url || '',
        })
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url || null,
        })
        .eq('id', restaurant.id)

      if (error) throw error

      // State'i güncelle
      setRestaurant({
        ...restaurant,
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url || null,
      })

      setToast({
        message: 'Restoran bilgileri başarıyla güncellendi!',
        type: 'success',
      })
    } catch (error) {
      console.error('Error updating restaurant:', error)
      setToast({
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
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
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restoran Ayarları
              </h1>
              <p className="text-sm text-gray-600">
                Restoran bilgilerini düzenleyin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Restoran Adı */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Restoran Adı
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Örn: Lezzet Durağı"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL Slug (Değiştirmeyin!)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="lezzet-duragi"
              required
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              URL'de kullanılır. Değiştirirseniz QR kodlar çalışmaz!
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Logo görselinin URL'sini girin (opsiyonel)
            </p>
          </div>

          {/* Logo Önizleme */}
          {formData.logo_url && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo Önizleme
              </label>
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = ''
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
