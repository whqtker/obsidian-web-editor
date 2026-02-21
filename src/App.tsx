import { AuthGate } from '@/components/auth/AuthGate'
import { RepoSelector } from '@/components/layout/RepoSelector'
import { useAuthStore } from '@/store/authStore'
import { useRepoStore } from '@/store/repoStore'

function Dashboard() {
  const { username, logout } = useAuthStore()
  const { owner, repo, branch } = useRepoStore()
  const isRepoConfigured = owner && repo

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-sm font-semibold">Obsidian Web Editor</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{username}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        {isRepoConfigured ? (
          <div className="text-center">
            <p className="text-gray-400">
              <span className="font-mono">{owner}/{repo}</span>
              <span className="text-gray-600 ml-2">({branch})</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">파일 트리 구현 예정</p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <RepoSelector />
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}

export default App
