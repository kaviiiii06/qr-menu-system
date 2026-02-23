'use client'

import { useState } from 'react'
import FloatingActionButton from './FloatingActionButton'
import Toast from './Toast'
import { supabase } from '@/lib/supabase'

export default function MenuClient({ restaurantId, tableId }) {
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleServiceRequest = async (type) => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from('service_requests').insert({
        table_id: tableId,
        restaurant_id: restaurantId,
        type: type,
        status: 'PENDING',
      })

      if (error) throw error

      // Başarı mesajı
      const messages = {
        CALL_WAITER: 'Garson çağrınız alındı! Kısa süre içinde masanıza gelecektir.',
        REQUEST_BILL: 'Hesap talebiniz alındı! Hesabınız getirilecektir.',
      }

      setToast({
        message: messages[type],
        type: 'success',
      })
    } catch (error) {
      console.error('Service request error:', error)
      setToast({
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseToast = () => {
    setToast(null)
  }

  return (
    <>
      <FloatingActionButton onRequest={handleServiceRequest} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </>
  )
}
