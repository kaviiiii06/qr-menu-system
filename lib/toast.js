// Toast bildirim sistemi
let toastContainer = null

// Toast container oluştur
function getToastContainer() {
  if (toastContainer) return toastContainer
  
  toastContainer = document.createElement('div')
  toastContainer.id = 'toast-container'
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `
  document.body.appendChild(toastContainer)
  return toastContainer
}

// Toast göster
export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer()
  
  const toast = document.createElement('div')
  toast.style.cssText = `
    background: ${getBackgroundColor(type)};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 12px;
  `
  
  const icon = getIcon(type)
  toast.innerHTML = `
    <span style="font-size: 20px;">${icon}</span>
    <span>${message}</span>
  `
  
  container.appendChild(toast)
  
  // Animasyon
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `
  if (!document.getElementById('toast-animations')) {
    style.id = 'toast-animations'
    document.head.appendChild(style)
  }
  
  // Otomatik kapat
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      container.removeChild(toast)
      if (container.children.length === 0) {
        document.body.removeChild(container)
        toastContainer = null
      }
    }, 300)
  }, duration)
  
  // Tıklayınca kapat
  toast.addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast)
      }
    }, 300)
  })
}

function getBackgroundColor(type) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }
  return colors[type] || colors.info
}

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }
  return icons[type] || icons.info
}

// Kısa yollar
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration),
}
