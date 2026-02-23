'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { playNotificationSound, showBrowserNotification } from '@/lib/notification'
import Toast from '@/components/Toast'

export default function AdminLayout({ children }) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Realtime channel oluştur - TÜM admin sayfalarında çalışacak
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_requests',
          filter: 'status=eq.PENDING',
        },
        async (payload) => {
          console.log('🔔 Yeni talep geldi:', payload)

          // Masa bilgisini çek
          const { data: tableData } = await supabase
            .from('tables')
            .select('table_number')
            .eq('id', payload.new.table_id)
            .single()

          const tableNumber = tableData?.table_number || '?'
          const requestType =
            payload.new.type === 'CALL_WAITER' ? 'Garson Çağırma' : 'Hesap İsteme'

          // Ses çal
          playNotificationSound()

          // Toast göster
          setToast({
            message: `🔔 Yeni talep: Masa ${tableNumber} - ${requestType}`,
            type: 'success',
          })

          // Browser notification
          showBrowserNotification(
            '🔔 Yeni Hizmet Talebi!',
            `Masa ${tableNumber} - ${requestType}`
          )
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
