'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export default function ProductCard({ product }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all border border-gray-100
        ${!product.is_available ? 'opacity-60' : 'hover:scale-[1.01]'}
      `}
    >
      <div className="flex gap-4 p-4">
        {/* Ürün Görseli */}
        <div className="flex-shrink-0 relative">
          {product.image_url ? (
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-gray-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="112px"
              />
              {!product.is_available && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Stokta Yok
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative ring-2 ring-gray-100">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {!product.is_available && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Stokta Yok
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Fiyat ve Durum */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
            {!product.is_available && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                Stokta Yok
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
