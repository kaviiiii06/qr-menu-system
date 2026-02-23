'use client'

import { useState } from 'react'
import { Bell, Receipt, Check, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function RequestCard({ request, onComplete }) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete(request.id)
    } catch (error) {
      console.error('Error completing request:', error)
      setIsCompleting(false)
    }
  }

  const typeConfig = {
    CALL_WAITER: {
      icon: Bell,
      label: 'Garson Çağırma',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    REQUEST_BILL: {
      icon: Receipt,
      label: 'Hesap İsteme',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  }

  const config = typeConfig[request.type] || typeConfig.CALL_WAITER
  const Icon = config.icon

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* İkon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* İçerik */}
        <div className="flex-1 min-w-0">
          {/* Masa Numarası Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 text-white">
              Masa {request.table?.table_number}
            </span>
            {request.restaurant?.name && (
              <span className="text-xs text-gray-500 truncate">
                {request.restaurant.name}
              </span>
            )}
          </div>

          {/* Talep Tipi */}
          <p className="text-base font-medium text-gray-800 mb-1">
            {config.label}
          </p>

          {/* Zaman Damgası */}
          <p className="text-sm text-gray-500">
            {formatRelativeTime(request.created_at)}
          </p>
        </div>

        {/* Tamamla Butonu */}
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          {isCompleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">İşleniyor...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Tamamlandı</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
