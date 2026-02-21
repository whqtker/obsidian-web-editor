import { useEffect, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useRepoStore } from '@/store/repoStore'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { MarkdownPreview } from './MarkdownPreview'
import { EditorToolbar } from './EditorToolbar'

export function EditorPanel() {
  const { openFile, isLoading, error, showPreview, updateContent, save } = useEditorStore()
  const { owner, repo, branch } = useRepoStore()

  const handleSave = useCallback(async () => {
    try {
      await save(owner, repo, undefined, branch)
    } catch {
      // error shown via store
    }
  }, [save, owner, repo, branch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-500">파일 로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (!openFile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-600">파일을 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <EditorToolbar />
      <div className="flex-1 min-h-0 flex">
        <div className={`${showPreview ? 'w-1/2 border-r border-gray-800' : 'w-full'} min-h-0 overflow-hidden`}>
          <CodeMirrorEditor value={openFile.content} onChange={updateContent} />
        </div>
        {showPreview && (
          <div className="w-1/2 min-h-0 overflow-hidden">
            <MarkdownPreview content={openFile.content} />
          </div>
        )}
      </div>
    </div>
  )
}
