'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser, isManager } from '@/lib/auth'
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  playTestSound,
  soundTypes 
} from '@/lib/notification'
import { ArrowLeft, Volume2, Bell, Smartphone, Vibrate } from 'lucide-react'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    soundEnabled: true,
    soundType: 'bell',
    volume: 0.7,
    browserNotification: true,
    vibrate: true,
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const user = getAuthUser()
    if (!user || (!isManager(user) && user.role !== 'OWNER')) {
      router.push('/login?type=admin')
      return
    }

    // Ayarları yükle
    const savedSettings = getNotificationSettings()
    setSettings(savedSettings)
  }, [router])

  const handleSave = () => {
    saveNotificationSettings(settings)
    setToast({ message: 'Ayarlar kaydedildi!', type: 'success' })
  }

  const handleTestSound = () => {
    playTestSound(settings.soundType, settings.volume)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setToast({ message: 'Bildirim izni verildi!', type: 'success' })
      } else {
        setToast({ message: 'Bildirim izni reddedildi', type: 'error' })
      }
    }
  }

  const soundOptions = [
    { value: 'bell', label: 'Zil 🔔', description: 'Klasik zil sesi' },
    { value: 'chime', label: 'Melodi 🎵', description: 'Yumuşak melodi' },
    { value: 'ding', label: 'Ding 🔊', description: 'Kısa ve net' },
    { value: 'beep', label: 'Bip ⚡', description: 'Elektronik bip' },
    { value: 'alert', label: 'Alarm 🚨', description: 'Acil uyarı' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h1>
              <p className="text-sm text-gray-600">
                Garson ve hesap isteme bildirimlerini özelleştirin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Ses Ayarları */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ses Ayarları</h2>
              <p className="text-sm text-gray-600">Bildirim sesini özelleştirin</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Ses Açık/Kapalı */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-gray-900">Ses Bildirimleri</label>
                <p className="text-sm text-gray-600">Yeni istek geldiğinde ses çal</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Ses Tipi Seçimi */}
            {settings.soundEnabled && (
              <>
                <div>
                  <label className="block font-semibold text-gray-900 mb-3">
                    Ses Tipi
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {soundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, soundType: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          settings.soundType === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ses Seviyesi */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-gray-900">Ses Seviyesi</label>
                    <span className="text-sm text-gray-600">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) =>
                      setSettings({ ...settings, volume: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Test Butonu */}
                <button
                  onClick={handleTestSound}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-5 h-5" />
                  Sesi Test Et
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tarayıcı Bildirimleri */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tarayıcı Bildirimleri</h2>
              <p className="text-sm text-gray-600">Masaüstü bildirimlerini yönetin</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-gray-900">Masaüstü Bildirimleri</label>
                <p className="text-sm text-gray-600">
                  Sekme arka planda olsa bile bildirim göster
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.browserNotification}
                  onChange={(e) =>
                    setSettings({ ...settings, browserNotification: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {settings.browserNotification && (
              <button
                onClick={requestNotificationPermission}
                className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold transition-colors"
              >
                Bildirim İzni Ver
              </button>
            )}
          </div>
        </div>

        {/* Titreşim */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mobil Ayarlar</h2>
              <p className="text-sm text-gray-600">Mobil cihazlar için özellikler</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-semibold text-gray-900">Titreşim</label>
              <p className="text-sm text-gray-600">
                Bildirim geldiğinde cihazı titret (mobil)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrate}
                onChange={(e) =>
                  setSettings({ ...settings, vibrate: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors shadow-lg"
        >
          Ayarları Kaydet
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
