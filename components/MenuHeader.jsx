'use client'

import Image from 'next/image'
import { Store } from 'lucide-react'

export default function MenuHeader({ restaurant, tableNumber }) {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Restoran Logosu */}
          <div className="flex-shrink-0">
            {restaurant.logo_url ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>

          {/* Restoran Bilgileri */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Masa {tableNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
