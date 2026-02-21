import { useEffect, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useRepoStore } from '@/store/repoStore'
import { useToastStore } from '@/store/toastStore'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { MarkdownPreview } from './MarkdownPreview'
import { EditorToolbar } from './EditorToolbar'
import { Spinner } from '@/components/ui/Spinner'
import { useImageUpload } from '@/hooks/useImageUpload'

export function EditorPanel() {
  const { openFile, isLoading, error, showPreview, updateContent, save, openPath } = useEditorStore()
  const { owner, repo, branch } = useRepoStore()
  const addToast = useToastStore((s) => s.addToast)
  const { uploadImage } = useImageUpload()

  const handleNavigate = useCallback(
    (path: string) => { openPath(owner, repo, path) },
    [openPath, owner, repo],
  )

  const handleSave = useCallback(async () => {
    try {
      await save(owner, repo, undefined, branch)
      addToast('success', '저장되었습니다.')
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : '저장에 실패했습니다.')
    }
  }, [save, owner, repo, branch, addToast])

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
        <Spinner label="파일 로딩 중..." />
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
          <CodeMirrorEditor value={openFile.content} onChange={updateContent} onImageUpload={uploadImage} />
        </div>
        {showPreview && (
          <div className="w-1/2 min-h-0 overflow-hidden">
            <MarkdownPreview content={openFile.content} onNavigate={handleNavigate} />
          </div>
        )}
      </div>
    </div>
  )
}
