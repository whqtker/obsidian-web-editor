import { useEditorStore } from '@/store/editorStore'
import { basename } from '@/utils/pathUtils'

interface EditorToolbarProps {
  onSave: () => Promise<void>
}

export function EditorToolbar({ onSave }: EditorToolbarProps) {
  const { openFile, isSaving, showPreview, closeFile, togglePreview } = useEditorStore()

  if (!openFile) return null

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
          className={`px-3 py-1.5 text-xs rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            showPreview
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          미리보기
        </button>
        <button
          onClick={onSave}
          disabled={!openFile.isDirty || isSaving}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={closeFile}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
