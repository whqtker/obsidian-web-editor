import { useState } from 'react'
import { deleteFile } from '@/api/contents'
import { useRepoStore } from '@/store/repoStore'
import { useTreeStore } from '@/store/treeStore'
import { useEditorStore } from '@/store/editorStore'
import { basename } from '@/utils/pathUtils'

interface ConfirmDeleteDialogProps {
  path: string
  sha: string
  onClose: () => void
}

export function ConfirmDeleteDialog({ path, sha, onClose }: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { owner, repo, branch } = useRepoStore()
  const { fetchTree } = useTreeStore()
  const { openFile, closeFile } = useEditorStore()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await deleteFile({
        owner,
        repo,
        path,
        sha,
        message: `Delete ${basename(path)}`,
        branch,
      })
      if (openFile?.path === path) {
        closeFile()
      }
      await fetchTree(owner, repo, branch)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-white mb-2">파일 삭제</h2>
        <p className="text-sm text-gray-300 mb-1">
          정말 삭제하시겠습니까?
        </p>
        <p className="text-xs text-gray-500 font-mono mb-4 break-all">{path}</p>
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
