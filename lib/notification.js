// Bildirim ayarlarını localStorage'dan al
export function getNotificationSettings() {
  if (typeof window === 'undefined') return getDefaultSettings()
  
  try {
    const settings = localStorage.getItem('notification_settings')
    return settings ? JSON.parse(settings) : getDefaultSettings()
  } catch (error) {
    console.error('Error loading notification settings:', error)
    return getDefaultSettings()
  }
}

// Varsayılan ayarlar
function getDefaultSettings() {
  return {
    soundEnabled: true,
    soundType: 'bell', // 'bell', 'chime', 'ding', 'beep', 'alert'
    volume: 0.7,
    browserNotification: true,
    vibrate: true,
  }
}

// Bildirim ayarlarını kaydet
export function saveNotificationSettings(settings) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('notification_settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving notification settings:', error)
  }
}

// Ses tipleri ve özellikleri
const soundTypes = {
  bell: { frequency: 800, duration: 0.3, type: 'sine' },
  chime: { frequency: 1200, duration: 0.4, type: 'sine' },
  ding: { frequency: 1500, duration: 0.2, type: 'triangle' },
  beep: { frequency: 600, duration: 0.15, type: 'square' },
  alert: { frequency: 900, duration: 0.5, type: 'sawtooth' },
}

// Bildirim sesi çalma fonksiyonu
export function playNotificationSound(soundType = null) {
  try {
    const settings = getNotificationSettings()
    
    if (!settings.soundEnabled) return
    
    const sound = soundTypes[soundType || settings.soundType] || soundTypes.bell
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = sound.frequency
    oscillator.type = sound.type

    gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sound.duration
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + sound.duration)
    
    // Titreşim
    if (settings.vibrate && 'vibrate' in navigator) {
      navigator.vibrate(200)
    }
  } catch (error) {
    console.error('Error playing notification sound:', error)
  }
}

// Test sesi çalma
export function playTestSound(soundType, volume = 0.7) {
  try {
    const sound = soundTypes[soundType] || soundTypes.bell
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = sound.frequency
    oscillator.type = sound.type

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sound.duration
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + sound.duration)
  } catch (error) {
    console.error('Error playing test sound:', error)
  }
}

// Browser notification izni kontrolü ve gösterme
export async function showBrowserNotification(title, body) {
  const settings = getNotificationSettings()
  
  if (!settings.browserNotification) return
  
  if (!('Notification' in window)) {
    console.log('Bu tarayıcı bildirimleri desteklemiyor')
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png',
    })
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/badge.png',
      })
    }
  }
}

// Ses tiplerini dışa aktar
export { soundTypes }
