import { useEffect, useCallback, useRef } from 'react'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useEditorStore } from '@/store/editorStore'
import { useRepoStore } from '@/store/repoStore'
import { useToastStore } from '@/store/toastStore'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { MarkdownPreview } from './MarkdownPreview'
import { EditorToolbar } from './EditorToolbar'
import { MarkdownToolbar } from './MarkdownToolbar'
import { ImageViewer } from './ImageViewer'
import { Spinner } from '@/components/ui/Spinner'
import { useImageUpload } from '@/hooks/useImageUpload'

export function EditorPanel() {
  const { openFile, isLoading, error, showPreview, updateContent, save, openPath } = useEditorStore()
  const { owner, repo, branch } = useRepoStore()
  const addToast = useToastStore((s) => s.addToast)
  const { uploadImage } = useImageUpload()
  const editorRef = useRef<ReactCodeMirrorRef>(null)

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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600 text-lg">
          ✎
        </div>
        <p className="text-sm text-gray-600">파일을 선택하세요</p>
        <p className="text-xs text-gray-700">Ctrl+P 로 파일 검색</p>
      </div>
    )
  }

  if (openFile.imageUrl) {
    return <ImageViewer path={openFile.path} imageUrl={openFile.imageUrl} />
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <EditorToolbar />
      <MarkdownToolbar editorRef={editorRef} />
      <div className="flex-1 min-h-0 flex">
        <div className={`${showPreview ? 'w-1/2 border-r border-gray-800' : 'w-full'} min-h-0 overflow-hidden`}>
          <CodeMirrorEditor value={openFile.content} onChange={updateContent} onImageUpload={uploadImage} editorRef={editorRef} />
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
