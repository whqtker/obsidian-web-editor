import { AuthGate } from '@/components/auth/AuthGate'
import { RepoSelector } from '@/components/layout/RepoSelector'
import { FileTree } from '@/components/filetree/FileTree'
import { EditorPanel } from '@/components/editor/EditorPanel'
import { useAuthStore } from '@/store/authStore'
import { useRepoStore } from '@/store/repoStore'
import { useEditorStore } from '@/store/editorStore'

function Dashboard() {
  const { username, logout } = useAuthStore()
  const { owner, repo, branch } = useRepoStore()
  const { openFile, openPath } = useEditorStore()
  const isRepoConfigured = owner && repo

  const handleFileSelect = (path: string) => {
    openPath(owner, repo, path)
  }

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
        <aside className="w-64 border-r border-gray-800 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-gray-800">
            <RepoSelector />
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <FileTree
              selectedPath={openFile?.path ?? null}
              onSelect={handleFileSelect}
            />
          </div>
        </aside>

        <EditorPanel />
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
