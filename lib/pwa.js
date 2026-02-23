// PWA Helper Functions

// Register service worker
export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    })
  }
}

// Check if app is installed
export function isInstalled() {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true
}

// Prompt install
let deferredPrompt = null

export function setupInstallPrompt() {
  if (typeof window === 'undefined') return
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
}

export async function promptInstall() {
  if (!deferredPrompt) {
    return { outcome: 'no-prompt' }
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  
  return { outcome }
}

// Check for updates
export function checkForUpdates() {
  if (typeof window === 'undefined') return
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update()
    })
  }
}

// Network status
export function getNetworkStatus() {
  if (typeof window === 'undefined') return { online: true }
  
  return {
    online: navigator.onLine,
    effectiveType: navigator.connection?.effectiveType || 'unknown',
    downlink: navigator.connection?.downlink || 0,
    rtt: navigator.connection?.rtt || 0,
  }
}

// Listen to network changes
export function onNetworkChange(callback) {
  if (typeof window === 'undefined') return () => {}
  
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
