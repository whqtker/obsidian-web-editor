import { useEffect } from 'react'
import { useTreeStore } from '@/store/treeStore'
import { useRepoStore } from '@/store/repoStore'
import { FileTreeNode } from './FileTreeNode'

interface FileTreeProps {
  selectedPath: string | null
  onSelect: (path: string) => void
}

export function FileTree({ selectedPath, onSelect }: FileTreeProps) {
  const { owner, repo, branch } = useRepoStore()
  const { tree, isLoading, error, truncated, fetchTree } = useTreeStore()

  useEffect(() => {
    if (owner && repo && branch) {
      fetchTree(owner, repo, branch)
    }
  }, [owner, repo, branch, fetchTree])

  if (isLoading) {
    return <p className="px-3 py-2 text-sm text-gray-500">파일 트리 로딩 중...</p>
  }

  if (error) {
    return <p className="px-3 py-2 text-sm text-red-400">{error}</p>
  }

  if (tree.length === 0) {
    return <p className="px-3 py-2 text-sm text-gray-500">파일이 없습니다.</p>
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {truncated && (
        <p className="px-3 py-1 text-xs text-yellow-500">
          레포가 너무 커서 일부만 표시됩니다.
        </p>
      )}
      {tree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
