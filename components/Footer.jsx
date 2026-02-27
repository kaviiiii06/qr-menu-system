'use client'

import { Phone, Instagram, Mail, MapPin, User } from 'lucide-react'

export default function Footer() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-4 border-t border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto">
        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Yetkili */}
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Yetkili</p>
              <p className="text-sm font-semibold">Baran Akbulut</p>
            </div>
          </div>

          {/* Telefon */}
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Telefon</p>
              <a
                href="tel:05389693606"
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                0538 969 36 06
              </a>
            </div>
          </div>

          {/* E-posta */}
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">E-posta</p>
              <a
                href="mailto:retkid191@gmail.com"
                className="text-sm font-semibold hover:text-primary transition-colors break-all"
              >
                retkid191@gmail.com
              </a>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="flex items-start gap-2">
            <Instagram className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Instagram</p>
              <a
                href="https://instagram.com/one.barann"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                @one.barann
              </a>
            </div>
          </div>
        </div>

        {/* Adres */}
        <div className="flex items-start gap-2 mb-4 pb-4 border-b border-gray-700">
          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-1">Adres</p>
            <p className="text-sm">
              Türkiye
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} QR Menü Sistemi. Tüm hakları saklıdır.</p>
          <p className="mt-1">Tasarım ve Geliştirme: Baran Akbulut</p>
        </div>
      </div>
    </div>
  )
}
