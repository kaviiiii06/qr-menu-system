// Basit şifre hash fonksiyonu (production'da bcrypt kullanın)
export function hashPassword(password) {
  // Bu basit bir hash, gerçek projede bcrypt kullanın
  return btoa(password + 'salt_key_2024')
}

export function verifyPassword(password, hash) {
  return hashPassword(password) === hash
}

export function setAuthUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user))
    sessionStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export function getAuthUser() {
  if (typeof window !== 'undefined') {
    try {
      // Önce sessionStorage'dan dene (mobil için)
      let user = sessionStorage.getItem('auth_user')
      
      // Yoksa localStorage'dan dene
      if (!user) {
        user = localStorage.getItem('auth_user')
      }
      
      if (!user) {
        return null
      }
      const parsed = JSON.parse(user)
      // Boş obje kontrolü
      if (!parsed || Object.keys(parsed).length === 0) {
        return null
      }
      return parsed
    } catch (error) {
      console.error('Error parsing auth_user:', error)
      return null
    }
  }
  return null
}

export function clearAuthUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_user')
  }
}

export function isOwner(user) {
  return user?.role === 'OWNER'
}

export function isManager(user) {
  return user?.role === 'MANAGER'
}

export function isWaiter(user) {
  return user?.role === 'WAITER'
}
