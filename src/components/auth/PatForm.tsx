import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export function PatForm() {
  const [pat, setPat] = useState('')
  const { login, isValidating, error } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pat.trim()) return
    try {
      await login(pat.trim())
    } catch {
      // error is handled by store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Obsidian Web Editor
        </h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          GitHub Personal Access Token을 입력하여 vault에 연결합니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pat" className="block text-sm font-medium text-gray-300 mb-1">
              Personal Access Token
            </label>
            <input
              id="pat"
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isValidating}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isValidating || !pat.trim()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
          >
            {isValidating ? '검증 중...' : '연결'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-600 text-center">
          PAT은 브라우저 localStorage에 저장됩니다. 공유 컴퓨터에서는 사용하지 마세요.
        </p>
        <p className="mt-1 text-xs text-gray-600 text-center">
          필요 권한: <code className="text-gray-500">repo</code> (또는 fine-grained의 Contents read/write)
        </p>
      </div>
    </div>
  )
}
