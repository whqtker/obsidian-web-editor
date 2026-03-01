import { useState, useEffect } from 'react'
import { AuthGate } from '@/components/auth/AuthGate'
import { RepoSelector } from '@/components/layout/RepoSelector'
import { FileTree } from '@/components/filetree/FileTree'
import { EditorPanel } from '@/components/editor/EditorPanel'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { SearchModal } from '@/components/ui/SearchModal'
import { useAuthStore } from '@/store/authStore'
import { useRepoStore } from '@/store/repoStore'
import { useEditorStore } from '@/store/editorStore'
import { useOpenPath } from '@/hooks/useOpenPath'

function Dashboard() {
  const { username, logout } = useAuthStore()
  const { owner, repo, branch } = useRepoStore()
  const openFile = useEditorStore((s) => s.openFile)
  const isRepoConfigured = !!(owner && repo)
  const [showSearch, setShowSearch] = useState(false)

  const handleFileSelect = useOpenPath()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isRepoConfigured) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="w-full max-w-sm">
          <RepoSelector />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/80 shrink-0 bg-gray-950/95 backdrop-blur-sm">
        <span className="text-sm font-semibold tracking-tight">Obsidian Web Editor</span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-mono">
            {owner}/{repo}
            <span className="text-gray-600 ml-1.5">({branch})</span>
          </span>
          <div className="w-px h-3 bg-gray-700" />
          <span className="text-xs text-gray-400">{username}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors rounded px-1.5 py-0.5 hover:bg-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-64 border-r border-gray-800/80 flex flex-col shrink-0 bg-gray-950">
          <div className="px-3 py-2.5 border-b border-gray-800/80">
            <RepoSelector />
          </div>
          <div className="flex-1 overflow-y-auto py-1.5">
            <FileTree
              selectedPath={openFile?.path ?? null}
              onSelect={handleFileSelect}
            />
          </div>
        </aside>

        <EditorPanel />
      </div>

      {showSearch && (
        <SearchModal
          onSelect={handleFileSelect}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthGate>
        <Dashboard />
      </AuthGate>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
