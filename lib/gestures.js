// Touch Gesture Helpers

export class SwipeDetector {
  constructor(element, options = {}) {
    this.element = element
    this.threshold = options.threshold || 50
    this.timeout = options.timeout || 300
    this.onSwipeLeft = options.onSwipeLeft || (() => {})
    this.onSwipeRight = options.onSwipeRight || (() => {})
    this.onSwipeUp = options.onSwipeUp || (() => {})
    this.onSwipeDown = options.onSwipeDown || (() => {})
    
    this.startX = 0
    this.startY = 0
    this.startTime = 0
    
    this.init()
  }
  
  init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }
  
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX
    this.startY = e.touches[0].clientY
    this.startTime = Date.now()
  }
  
  handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const endTime = Date.now()
    
    const diffX = endX - this.startX
    const diffY = endY - this.startY
    const diffTime = endTime - this.startTime
    
    if (diffTime > this.timeout) return
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > this.threshold) {
        if (diffX > 0) {
          this.onSwipeRight()
        } else {
          this.onSwipeLeft()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > this.threshold) {
        if (diffY > 0) {
          this.onSwipeDown()
        } else {
          this.onSwipeUp()
        }
      }
    }
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }
}

// Long press detector
export class LongPressDetector {
  constructor(element, options = {}) {
    this.element = element
    this.duration = options.duration || 500
    this.onLongPress = options.onLongPress || (() => {})
    
    this.timer = null
    this.isPressed = false
    
    this.init()
  }
  
  init() {
    this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true })
    this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: true })
    this.element.addEventListener('touchmove', this.handleEnd.bind(this), { passive: true })
  }
  
  handleStart() {
    this.isPressed = true
    this.timer = setTimeout(() => {
      if (this.isPressed) {
        this.onLongPress()
      }
    }, this.duration)
  }
  
  handleEnd() {
    this.isPressed = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
  
  destroy() {
    this.handleEnd()
    this.element.removeEventListener('touchstart', this.handleStart)
    this.element.removeEventListener('touchend', this.handleEnd)
    this.element.removeEventListener('touchmove', this.handleEnd)
  }
}

// Pull to refresh
export class PullToRefresh {
  constructor(element, options = {}) {
    this.element = element
    this.threshold = options.threshold || 80
    this.onRefresh = options.onRefresh || (() => {})
    
    this.startY = 0
    this.currentY = 0
    this.isRefreshing = false
    
    this.init()
  }
  
  init() {
    this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true })
    this.element.addEventListener('touchmove', this.handleMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: true })
  }
  
  handleStart(e) {
    if (this.element.scrollTop === 0) {
      this.startY = e.touches[0].clientY
    }
  }
  
  handleMove(e) {
    if (this.isRefreshing) return
    
    this.currentY = e.touches[0].clientY
    const diff = this.currentY - this.startY
    
    if (diff > 0 && this.element.scrollTop === 0) {
      e.preventDefault()
      // Visual feedback here
    }
  }
  
  async handleEnd() {
    if (this.isRefreshing) return
    
    const diff = this.currentY - this.startY
    
    if (diff > this.threshold && this.element.scrollTop === 0) {
      this.isRefreshing = true
      await this.onRefresh()
      this.isRefreshing = false
    }
    
    this.startY = 0
    this.currentY = 0
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleStart)
    this.element.removeEventListener('touchmove', this.handleMove)
    this.element.removeEventListener('touchend', this.handleEnd)
  }
}

// Haptic feedback
export function vibrate(pattern = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function vibrateSuccess() {
  vibrate([10, 50, 10])
}

export function vibrateError() {
  vibrate([50, 100, 50])
}

export function vibrateWarning() {
  vibrate([30, 50, 30])
}
