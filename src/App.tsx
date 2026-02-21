import { useState } from 'react'
import { AuthGate } from '@/components/auth/AuthGate'
import { RepoSelector } from '@/components/layout/RepoSelector'
import { FileTree } from '@/components/filetree/FileTree'
import { useAuthStore } from '@/store/authStore'
import { useRepoStore } from '@/store/repoStore'

function Dashboard() {
  const { username, logout } = useAuthStore()
  const { owner, repo, branch } = useRepoStore()
  const isRepoConfigured = owner && repo
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  if (!isRepoConfigured) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-sm">
          <RepoSelector />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <span className="text-sm font-semibold">Obsidian Web Editor</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">
            {owner}/{repo}
            <span className="text-gray-700 ml-1">({branch})</span>
          </span>
          <span className="text-xs text-gray-400">{username}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-gray-800">
            <RepoSelector />
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <FileTree selectedPath={selectedPath} onSelect={setSelectedPath} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center">
          {selectedPath ? (
            <p className="text-gray-400 text-sm">
              선택: <span className="font-mono">{selectedPath}</span>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">파일을 선택하세요</p>
          )}
        </main>
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
