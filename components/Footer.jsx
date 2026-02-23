'use client'

import { Phone, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 px-4 z-20 border-t border-gray-700">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 text-xs">
        <span className="text-gray-400">Tasarım:</span>
        <span className="font-semibold">Baran Akbulut</span>
        <div className="flex items-center gap-3">
          <a
            href="tel:05389693606"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>0538 969 36 06</span>
          </a>
          <a
            href="https://instagram.com/one.barann"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Instagram className="w-3 h-3" />
            <span>@one.barann</span>
          </a>
        </div>
      </div>
    </div>
  )
}
