import { useState } from 'react'
import { createFile } from '@/api/contents'
import { useRepoStore } from '@/store/repoStore'
import { useTreeStore } from '@/store/treeStore'
import { useEditorStore } from '@/store/editorStore'
import { useToastStore } from '@/store/toastStore'
import { joinPath, basename } from '@/utils/pathUtils'

interface NewFileDialogProps {
  directory: string
  onClose: () => void
}

export function NewFileDialog({ directory, onClose }: NewFileDialogProps) {
  const [filename, setFilename] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { owner, repo, branch } = useRepoStore()
  const addNode = useTreeStore((s) => s.addNode)
  const { openPath } = useEditorStore()
  const addToast = useToastStore((s) => s.addToast)

  const normalizedName = filename.trim()
  const finalName = normalizedName && !normalizedName.endsWith('.md')
    ? `${normalizedName}.md`
    : normalizedName
  const fullPath = directory ? joinPath(directory, finalName) : finalName

  const validate = (): string | null => {
    if (!normalizedName) return '파일명을 입력하세요.'
    if (/[\\:*?"<>|]/.test(normalizedName)) return '파일명에 사용할 수 없는 문자가 포함되어 있습니다.'
    if (normalizedName.startsWith('.')) return '파일명은 .으로 시작할 수 없습니다.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsCreating(true)
    setError(null)
    try {
      const { sha } = await createFile({
        owner,
        repo,
        path: fullPath,
        content: '',
        message: `Create ${basename(fullPath)}`,
        branch,
      })
      addNode(fullPath, sha)
      addToast('success', `${basename(fullPath)} 파일이 생성되었습니다.`)
      onClose()
      openPath(owner, repo, fullPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 생성에 실패했습니다.')
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm mx-4 animate-[modalIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-white mb-3">새 파일 생성</h2>
        {directory && (
          <p className="text-xs text-gray-500 mb-2 font-mono">{directory}/</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={filename}
            onChange={(e) => { setFilename(e.target.value); setError(null) }}
            placeholder="파일명 (.md 자동 추가)"
            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isCreating}
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isCreating}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isCreating || !normalizedName}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {isCreating ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
