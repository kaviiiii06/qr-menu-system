// Simple in-memory cache with TTL
class Cache {
  constructor() {
    this.cache = new Map()
  }

  set(key, value, ttl = 60000) { // Default 1 minute
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Invalidate all keys matching pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cache = new Cache()

// Cache helper for Supabase queries
export async function cachedQuery(key, queryFn, ttl = 60000) {
  const cached = cache.get(key)
  if (cached) return cached

  const result = await queryFn()
  cache.set(key, result, ttl)
  return result
}

// Invalidate cache on mutations
export function invalidateCache(patterns) {
  if (Array.isArray(patterns)) {
    patterns.forEach(pattern => cache.invalidatePattern(pattern))
  } else {
    cache.invalidatePattern(patterns)
  }
}
