'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthUser, isOwner, hashPassword } from '@/lib/auth'
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

export default function UsersManagePage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id
  
  const [restaurant, setRestaurant] = useState(null)
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPasswords, setShowPasswords] = useState({})
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'MANAGER',
    is_active: true
  })

  useEffect(() => {
    const authUser = getAuthUser()
    if (!authUser || !isOwner(authUser)) {
      router.push('/login?type=owner')
      return
    }
    loadRestaurant()
    loadUsers()
  }, [router, restaurantId])

  const loadRestaurant = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()
    
    if (data) setRestaurant(data)
  }

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const userData = {
      ...formData,
      restaurant_id: restaurantId,
      password_hash: formData.password ? hashPassword(formData.password) : undefined,
      password: formData.password || undefined // Düz metin şifre
    }

    delete userData.password

    if (editingUser) {
      if (!formData.password) {
        delete userData.password_hash
        delete userData.password
      }
      
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', editingUser.id)

      if (!error) {
        loadUsers()
        closeModal()
      }
    } else {
      const { error } = await supabase
        .from('users')
        .insert([userData])

      if (!error) {
        loadUsers()
        closeModal()
      } else {
        alert('Hata: ' + error.message)
      }
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (!error) loadUsers()
    }
  }

  const toggleActive = async (user) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)

    if (!error) loadUsers()
  }

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '',
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'MANAGER',
        is_active: true
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  if (!restaurant) return null

  const getRoleName = (role) => {
    const roles = { OWNER: 'Kurucu', MANAGER: 'Yönetici', WAITER: 'Garson' }
    return roles[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      OWNER: 'bg-purple-100 text-purple-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      WAITER: 'bg-green-100 text-green-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/owner/restaurant/${restaurantId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
              <p className="text-gray-600 mt-1">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şifre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {showPasswords[u.id] ? (u.password || '••••••••') : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={showPasswords[u.id] ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        {showPasswords[u.id] ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.full_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(u.role)}`}>
                      {getRoleName(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre {editingUser && '(boş bırakın değiştirmek istemiyorsanız)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="MANAGER">Yönetici</option>
                  <option value="WAITER">Garson</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktif</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  {editingUser ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
