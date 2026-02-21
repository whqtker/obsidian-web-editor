import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateToken, createOctokitClient, clearOctokitClient } from '@/api/github'

interface AuthState {
  pat: string | null
  username: string | null
  avatarUrl: string | null
  isAuthenticated: boolean
  isValidating: boolean
  error: string | null
}

interface AuthActions {
  login: (pat: string) => Promise<void>
  logout: () => void
  rehydrate: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      pat: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
      isValidating: false,
      error: null,

      login: async (pat: string) => {
        set({ isValidating: true, error: null })
        try {
          const { login, avatarUrl } = await validateToken(pat)
          createOctokitClient(pat)
          set({
            pat,
            username: login,
            avatarUrl,
            isAuthenticated: true,
            isValidating: false,
            error: null,
          })
        } catch (err) {
          set({
            pat: null,
            username: null,
            avatarUrl: null,
            isAuthenticated: false,
            isValidating: false,
            error: err instanceof Error ? err.message : 'PAT 검증에 실패했습니다.',
          })
          throw err
        }
      },

      logout: () => {
        clearOctokitClient()
        set({
          pat: null,
          username: null,
          avatarUrl: null,
          isAuthenticated: false,
          isValidating: false,
          error: null,
        })
      },

      rehydrate: () => {
        const { pat } = get()
        if (pat) {
          createOctokitClient(pat)
        }
      },
    }),
    {
      name: 'obsidian-auth',
      partialize: (state) => ({
        pat: state.pat,
        username: state.username,
        avatarUrl: state.avatarUrl,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
