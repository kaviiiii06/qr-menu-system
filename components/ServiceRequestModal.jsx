'use client'

import { X, Bell, Receipt, Sparkles } from 'lucide-react'

export default function ServiceRequestModal({ isOpen, onClose, onRequest }) {
  if (!isOpen) return null

  const handleRequest = (type) => {
    onRequest(type)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-t-3xl shadow-2xl max-w-lg mx-auto border-t-4 border-primary">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-800">
                Hizmet Talebi
              </h2>
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-center text-sm text-gray-600">
              Size nasıl yardımcı olabiliriz?
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Kapat"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Garson Çağır Butonu - Daha Büyük ve Belirgin */}
            <button
              onClick={() => handleRequest('CALL_WAITER')}
              className="w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-600 to-primary bg-[length:200%_100%] animate-gradient"></div>
              <div className="relative flex items-center gap-4 p-6 rounded-2xl transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Bell className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xl text-white mb-1">
                    Garson Çağır
                  </div>
                  <div className="text-sm text-white/90">
                    Garson masanıza gelecektir
                  </div>
                </div>
                <div className="text-white/80">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Hesap İste Butonu */}
            <button
              onClick={() => handleRequest('REQUEST_BILL')}
              className="w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]"></div>
              <div className="relative flex items-center gap-4 p-6 rounded-2xl border-2 border-gray-300 transition-all group-hover:border-gray-400 group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-xl text-white mb-1">
                    Hesap İste
                  </div>
                  <div className="text-sm text-white/80">
                    Hesabınız getirilecektir
                  </div>
                </div>
                <div className="text-white/60">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2">
            <button
              onClick={onClose}
              className="w-full py-4 text-gray-600 hover:text-gray-800 font-semibold transition-colors rounded-xl hover:bg-gray-100"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
