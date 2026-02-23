'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser, isOwner } from '@/lib/auth'

export default function OwnerProductsPage() {
  const router = useRouter()
  
  useEffect(() => {
    const authUser = getAuthUser()
    if (!authUser || !isOwner(authUser)) {
      router.push('/login?type=owner')
      return
    }
    router.push('/admin/products')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
