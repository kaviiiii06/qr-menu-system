'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Menu page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Menü Yüklenemedi
        </h1>
        <p className="text-gray-600 mb-6">
          Menü bilgileri yüklenirken bir hata oluştu. Lütfen QR kodu tekrar
          okutun veya garsonunuza haber verin.
        </p>
        <button
          onClick={reset}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}
