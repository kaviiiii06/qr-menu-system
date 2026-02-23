'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'
import { LogIn, Store, UserCircle, Crown } from 'lucide-react'
import { auditLog } from '@/lib/auditLog'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'admin'
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const passwordHash = hashPassword(password)
      
      // Kullanıcıyı bul
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .eq('is_active', true)
        .single()

      if (dbError || !data) {
        setError('Kullanıcı adı veya şifre hatalı')
        setIsLoading(false)
        return
      }

      // Rol kontrolü
      if (type === 'owner' && data.role !== 'OWNER') {
        setError('Bu kullanıcı kurucu paneline giriş yapamaz')
        setIsLoading(false)
        return
      }

      if (type === 'admin' && (data.role !== 'MANAGER' && data.role !== 'OWNER')) {
        setError('Bu kullanıcı işletme paneline giriş yapamaz')
        setIsLoading(false)
        return
      }

      if (type === 'waiter' && data.role !== 'WAITER') {
        setError('Bu kullanıcı garson paneline giriş yapamaz')
        setIsLoading(false)
        return
      }

      // Kullanıcıyı localStorage'a kaydet
      try {
        localStorage.setItem('auth_user', JSON.stringify(data))
        
        // Kaydedildiğini doğrula
        const saved = localStorage.getItem('auth_user')
        if (!saved) {
          throw new Error('localStorage yazma başarısız')
        }
        
        const parsed = JSON.parse(saved)
        if (!parsed.restaurant_id && data.role !== 'OWNER') {
          throw new Error('restaurant_id kaydedilmedi')
        }

        // Audit log
        if (data.restaurant_id) {
          auditLog.userLogin(data, data.restaurant_id)
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError)
        setError('Giriş bilgileri kaydedilemedi: ' + storageError.message)
        setIsLoading(false)
        return
      }

      // Yönlendir
      if (data.role === 'OWNER') {
        window.location.href = '/owner'
      } else if (data.role === 'MANAGER') {
        window.location.href = '/admin'
      } else if (data.role === 'WAITER') {
        window.location.href = '/waiter/orders'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Giriş yapılırken bir hata oluştu')
      setIsLoading(false)
    }
  }

  const isOwnerLogin = type === 'owner'
  const isAdminLogin = type === 'admin'
  const isWaiterLogin = type === 'waiter'

  const getTitle = () => {
    if (isOwnerLogin) return 'Kurucu Girişi'
    if (isAdminLogin) return 'İşletme Girişi'
    return 'Garson Girişi'
  }

  const getIcon = () => {
    if (isOwnerLogin) return <Crown className="w-8 h-8 text-white" />
    if (isAdminLogin) return <Store className="w-8 h-8 text-primary" />
    return <UserCircle className="w-8 h-8 text-green-600" />
  }

  const getBgColor = () => {
    if (isOwnerLogin) return 'bg-purple-500'
    if (isAdminLogin) return 'bg-primary/10'
    return 'bg-green-100'
  }

  const getButtonColor = () => {
    if (isOwnerLogin) return 'bg-purple-600 hover:bg-purple-700'
    if (isAdminLogin) return 'bg-primary hover:bg-primary/90'
    return 'bg-green-600 hover:bg-green-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getBgColor()}`}>
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600">
            Kullanıcı adı ve şifrenizi girin
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="kullaniciadi"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  )
}
