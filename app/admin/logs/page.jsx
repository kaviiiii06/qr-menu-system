'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isManager } from '@/lib/auth'
import { ArrowLeft, Activity, Filter, Download } from 'lucide-react'
import Link from 'next/link'

export default function AuditLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterEntity, setFilterEntity] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const user = getAuthUser()
    if (!user || (!isManager(user) && user.role !== 'OWNER')) {
      router.push('/login?type=admin')
      return
    }

    if (user.role === 'OWNER') {
      loadLogsForOwner()
    } else {
      if (!user.restaurant_id) {
        alert('Kullanıcı bir işletmeye bağlı değil.')
        router.push('/')
        return
      }
      loadLogs(user.restaurant_id)
    }

    // Realtime subscription
    const channel = supabase
      .channel('audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        if (user.role === 'OWNER') {
          loadLogsForOwner()
        } else {
          loadLogs(user.restaurant_id)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [logs, filterAction, filterEntity, searchTerm])

  const loadLogsForOwner = async () => {
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1)
      .single()

    if (restaurantData) {
      loadLogs(restaurantData.id)
    }
  }

  const loadLogs = async (restaurantId) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (filterAction !== 'ALL') {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (filterEntity !== 'ALL') {
      filtered = filtered.filter(log => log.entity_type === filterEntity)
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      default: return '📝'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportLogs = () => {
    const csv = [
      ['Tarih', 'Kullanıcı', 'İşlem', 'Tür', 'Detay'].join(','),
      ...filteredLogs.map(log => [
        formatDate(log.created_at),
        log.user_name,
        log.action,
        log.entity_type,
        log.entity_name
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Aktivite Logları
                </h1>
                <p className="text-sm text-gray-600">{filteredLogs.length} kayıt</p>
              </div>
            </div>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtreler */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Filtreler</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="ALL">Tüm İşlemler</option>
              <option value="CREATE">Oluşturma</option>
              <option value="UPDATE">Güncelleme</option>
              <option value="DELETE">Silme</option>
            </select>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="ALL">Tüm Türler</option>
              <option value="ORDER">Sipariş</option>
              <option value="ORDER_ITEM">Sipariş Ürünü</option>
              <option value="PRODUCT">Ürün</option>
              <option value="CATEGORY">Kategori</option>
              <option value="USER">Kullanıcı</option>
            </select>
          </div>
        </div>

        {/* Log Listesi */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{log.user_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)} {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.entity_type}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{log.entity_name}</div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Kayıt bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
