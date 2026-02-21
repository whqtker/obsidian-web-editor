import { useEditorStore } from '@/store/editorStore'
import { useRepoStore } from '@/store/repoStore'
import { basename } from '@/utils/pathUtils'

export function EditorToolbar() {
  const { openFile, isSaving, showPreview, save, closeFile, togglePreview } = useEditorStore()
  const { owner, repo, branch } = useRepoStore()

  if (!openFile) return null

  const handleSave = async () => {
    try {
      await save(owner, repo, undefined, branch)
    } catch {
      // error shown via store
    }
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-300 truncate">
          {basename(openFile.path)}
        </span>
        {openFile.isDirty && (
          <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" title="수정됨" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={togglePreview}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showPreview
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          미리보기
        </button>
        <button
          onClick={handleSave}
          disabled={!openFile.isDirty || isSaving}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={closeFile}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
