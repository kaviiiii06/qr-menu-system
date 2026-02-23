'use client'

import { useState } from 'react'
import { Bell, HandPlatter } from 'lucide-react'
import ServiceRequestModal from './ServiceRequestModal'

export default function FloatingActionButton({ onRequest }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleRequest = (type) => {
    onRequest(type)
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Floating Action Button - Daha Büyük ve Belirgin */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 z-30 group"
        aria-label="Garson Çağır"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
        
        {/* Main Button */}
        <div className="relative bg-gradient-to-br from-primary to-orange-700 text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 active:scale-95 p-5">
          <div className="flex flex-col items-center gap-1">
            <HandPlatter className="w-8 h-8" strokeWidth={2.5} />
            <span className="text-xs font-bold whitespace-nowrap">GARSON</span>
          </div>
        </div>

        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20"></div>
      </button>

      {/* Modal */}
      <ServiceRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRequest={handleRequest}
      />
    </>
  )
}
