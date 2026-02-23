// Responsive Utilities

// Detect device type
export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop'
  
  const ua = navigator.userAgent
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  
  return 'desktop'
}

// Check if mobile
export function isMobile() {
  return getDeviceType() === 'mobile'
}

// Check if tablet
export function isTablet() {
  return getDeviceType() === 'tablet'
}

// Check if desktop
export function isDesktop() {
  return getDeviceType() === 'desktop'
}

// Get screen size
export function getScreenSize() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// Check if landscape
export function isLandscape() {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

// Check if portrait
export function isPortrait() {
  return !isLandscape()
}

// Get safe area insets (for notch devices)
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  }
}

// Prevent zoom on double tap
export function preventZoom() {
  if (typeof document === 'undefined') return
  
  let lastTouchEnd = 0
  
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
}

// Lock orientation
export function lockOrientation(orientation = 'portrait') {
  if (typeof screen === 'undefined' || !screen.orientation) return
  
  try {
    screen.orientation.lock(orientation)
  } catch (error) {
    console.warn('Orientation lock not supported:', error)
  }
}

// Unlock orientation
export function unlockOrientation() {
  if (typeof screen === 'undefined' || !screen.orientation) return
  
  try {
    screen.orientation.unlock()
  } catch (error) {
    console.warn('Orientation unlock not supported:', error)
  }
}

// Full screen
export function requestFullscreen(element = document.documentElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

// Responsive breakpoints (Tailwind defaults)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function isBreakpoint(breakpoint) {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints[breakpoint]
}

// Listen to resize
export function onResize(callback) {
  if (typeof window === 'undefined') return () => {}
  
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

// Listen to orientation change
export function onOrientationChange(callback) {
  if (typeof window === 'undefined') return () => {}
  
  window.addEventListener('orientationchange', callback)
  return () => window.removeEventListener('orientationchange', callback)
}
