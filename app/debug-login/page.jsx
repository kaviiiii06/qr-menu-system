'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export default function DebugLoginPage() {
  const [username, setUsername] = useState('baran')
  const [password, setPassword] = useState('BARANbaba123')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // 1. Supabase bağlantısını test et
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      const connectionTest = {
        success: !testError,
        error: testError?.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }

      // 2. Kullanıcıyı ara
      const passwordHash = hashPassword(password)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)

      // 3. Şifre kontrolü
      const userWithPassword = userData?.[0]
      const passwordMatch = userWithPassword?.password_hash === passwordHash

      setResult({
        connection: connectionTest,
        user: {
          found: !!userData && userData.length > 0,
          data: userData?.[0],
          error: userError?.message
        },
        password: {
          input: password,
          hash: passwordHash,
          stored: userWithPassword?.password_hash,
          match: passwordMatch
        }
      })
    } catch (err) {
      setResult({
        error: err.message,
        stack: err.stack
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Login Debug Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
