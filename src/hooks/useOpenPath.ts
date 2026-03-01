import { useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useRepoStore } from '@/store/repoStore'

export function useOpenPath(): (path: string) => void {
  const openPath = useEditorStore((s) => s.openPath)
  const { owner, repo } = useRepoStore()
  return useCallback(
    (path: string) => { openPath(owner, repo, path) },
    [openPath, owner, repo],
  )
}
