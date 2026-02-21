import { create } from 'zustand'
import { fetchFile, saveFile } from '@/api/contents'
import { rethrowWithAuthCheck } from '@/api/github'
import { basename } from '@/utils/pathUtils'
import type { OpenFile } from '@/types/editor'

interface EditorState {
  openFile: OpenFile | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  showPreview: boolean
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

  openPath: async (owner, repo, path) => {
    set({ isLoading: true, error: null })
    try {
      const { content, sha } = await fetchFile(owner, repo, path)
      set({
        openFile: {
          path,
          sha,
          content,
          isDirty: false,
          lastFetchedAt: Date.now(),
        },
        isLoading: false,
      })
    } catch (err) {
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
    set({ openFile: null, error: null })
  },

  togglePreview: () => {
    set((state) => ({ showPreview: !state.showPreview }))
  },
}))
