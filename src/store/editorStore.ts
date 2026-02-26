import { create } from 'zustand'
import { fetchFile, fetchImageUrl, saveFile } from '@/api/contents'
import { rethrowWithAuthCheck } from '@/api/github'
import { basename, isImage } from '@/utils/pathUtils'
import type { OpenFile } from '@/types/editor'

interface EditorState {
  openFile: OpenFile | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  showPreview: boolean
  _requestId: number
}

interface EditorActions {
  openPath: (owner: string, repo: string, path: string) => Promise<void>
  updateContent: (content: string) => void
  save: (owner: string, repo: string, message?: string, branch?: string) => Promise<void>
  closeFile: () => void
  togglePreview: () => void
}

export const useEditorStore = create<EditorState & EditorActions>()((set, get) => ({
  openFile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  showPreview: false,
  _requestId: 0,

  openPath: async (owner, repo, path) => {
    const requestId = get()._requestId + 1
    set({ isLoading: true, error: null, _requestId: requestId })
    try {
      if (isImage(path)) {
        const { downloadUrl, sha } = await fetchImageUrl(owner, repo, path)
        if (get()._requestId !== requestId) return
        set({
          openFile: { path, sha, content: '', isDirty: false, lastFetchedAt: Date.now(), imageUrl: downloadUrl },
          isLoading: false,
        })
      } else {
        const { content, sha } = await fetchFile(owner, repo, path)
        if (get()._requestId !== requestId) return
        set({
          openFile: { path, sha, content, isDirty: false, lastFetchedAt: Date.now() },
          isLoading: false,
        })
      }
    } catch (err) {
      if (get()._requestId !== requestId) return
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : '파일을 열 수 없습니다.',
      })
      rethrowWithAuthCheck(err)
    }
  },

  updateContent: (content) => {
    const { openFile } = get()
    if (!openFile) return
    set({
      openFile: { ...openFile, content, isDirty: true },
    })
  },

  save: async (owner, repo, message?, branch?) => {
    const { openFile } = get()
    if (!openFile || !openFile.isDirty) return

    set({ isSaving: true, error: null })
    try {
      const commitMessage = message || `Update ${basename(openFile.path)}`
      const { sha } = await saveFile({
        owner,
        repo,
        path: openFile.path,
        content: openFile.content,
        sha: openFile.sha,
        message: commitMessage,
        branch,
      })
      set({
        openFile: { ...openFile, sha, isDirty: false, lastFetchedAt: Date.now() },
        isSaving: false,
      })
    } catch (err) {
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : '저장에 실패했습니다.',
      })
      rethrowWithAuthCheck(err)
    }
  },

  closeFile: () => {
    set((state) => ({ openFile: null, error: null, isLoading: false, _requestId: state._requestId + 1 }))
  },

  togglePreview: () => {
    set((state) => ({ showPreview: !state.showPreview }))
  },
}))
