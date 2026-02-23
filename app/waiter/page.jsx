'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn } from 'lucide-react'

export default function WaiterLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit)
      setError('')
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleLogin = async () => {
    if (pin.length !== 4) return

    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('waiters')
        .select('id, name, restaurant_id')
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setError('Geçersiz PIN kodu')
        setPin('')
        return
      }

      // Garson bilgilerini auth formatında kaydet (mobil için hem localStorage hem sessionStorage)
      const authUser = {
        id: data.id,
        full_name: data.name,
        role: 'WAITER',
        restaurant_id: data.restaurant_id
      }
      
      // Hem localStorage hem sessionStorage'a kaydet
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      sessionStorage.setItem('auth_user', JSON.stringify(authUser))
      
      // Mobil tarayıcılar için window.location kullan
      window.location.href = '/waiter/orders'
    } catch (err) {
      console.error('Login error:', err)
      setError('Giriş yapılırken bir hata oluştu')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garson Girişi</h1>
          <p className="text-gray-600">4 haneli PIN kodunuzu girin</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                pin.length > i
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-300'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(num.toString())}
              disabled={isLoading}
              className="h-16 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-2xl font-semibold text-gray-700 transition-colors disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            disabled={isLoading || pin.length === 0}
            className="h-16 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-lg font-semibold text-gray-700 transition-colors disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={() => handlePinInput('0')}
            disabled={isLoading}
            className="h-16 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-2xl font-semibold text-gray-700 transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={isLoading || pin.length !== 4}
            className="h-16 bg-primary hover:bg-primary/90 active:bg-primary/80 rounded-xl text-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          PIN kodunuzu unuttuysanız yöneticinize başvurun
        </p>
      </div>
    </div>
  )
}
