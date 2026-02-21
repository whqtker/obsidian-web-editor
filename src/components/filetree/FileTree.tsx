import { useEffect, useState } from 'react'
import { useTreeStore } from '@/store/treeStore'
import { useRepoStore } from '@/store/repoStore'
import { FileTreeNode } from './FileTreeNode'
import { NewFileDialog } from './NewFileDialog'
import { Spinner } from '@/components/ui/Spinner'

interface FileTreeProps {
  selectedPath: string | null
  onSelect: (path: string) => void
}

export function FileTree({ selectedPath, onSelect }: FileTreeProps) {
  const { owner, repo, branch } = useRepoStore()
  const { tree, isLoading, error, truncated, fetchTree } = useTreeStore()
  const [newFileDir, setNewFileDir] = useState<string | null>(null)

  useEffect(() => {
    if (owner && repo && branch) {
      fetchTree(owner, repo, branch)
    }
  }, [owner, repo, branch, fetchTree])

  if (isLoading) {
    return <div className="px-3 py-2"><Spinner size="sm" label="파일 트리 로딩 중..." /></div>
  }

  if (error) {
    return <p className="px-3 py-2 text-sm text-red-400">{error}</p>
  }

  return (
    <div className="flex flex-col">
      <div className="px-2 py-1.5 flex justify-end">
        <button
          onClick={() => setNewFileDir('')}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="루트에 새 파일 생성"
        >
          + 새 파일
        </button>
      </div>

      {truncated && (
        <p className="px-3 py-1 text-xs text-yellow-500">
          레포가 너무 커서 일부만 표시됩니다.
        </p>
      )}

      {tree.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-500">파일이 없습니다.</p>
      ) : (
        tree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            onNewFile={setNewFileDir}
          />
        ))
      )}

      {newFileDir !== null && (
        <NewFileDialog
          directory={newFileDir}
          onClose={() => setNewFileDir(null)}
        />
      )}
    </div>
  )
}
