'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-red-600 mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bir Hata Oluştu
        </h1>
        <p className="text-gray-600 mb-6">
          Üzgünüz, bir şeyler yanlış gitti. Lütfen tekrar deneyin.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  )
}
