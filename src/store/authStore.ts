import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  fetchAuthenticatedUser,
  buildOAuthUrl,
  exchangeCodeForToken,
  createOctokitClient,
  clearOctokitClient,
  setAuthErrorHandler,
} from '@/api/github'

interface AuthState {
  token: string | null
  username: string | null
  avatarUrl: string | null
  isAuthenticated: boolean
  isExchanging: boolean
  error: string | null
}

interface AuthActions {
  initiateOAuth: () => void
  handleOAuthCallback: (code: string, state: string) => Promise<void>
  logout: () => void
  rehydrate: () => void
  handleAuthError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
      isExchanging: false,
      error: null,

      initiateOAuth: () => {
        const state = crypto.randomUUID()
        sessionStorage.setItem('oauth_state', state)
        window.location.href = buildOAuthUrl(state)
      },

      handleOAuthCallback: async (code: string, state: string) => {
        const savedState = sessionStorage.getItem('oauth_state')
        sessionStorage.removeItem('oauth_state')

        if (!savedState || savedState !== state) {
          set({ error: '인증 상태가 유효하지 않습니다. 다시 시도해주세요.', isExchanging: false })
          return
        }

        set({ isExchanging: true, error: null })

        try {
          const token = await exchangeCodeForToken(code)
          const { login, avatarUrl } = await fetchAuthenticatedUser(token)
          createOctokitClient(token)
          set({ token, username: login, avatarUrl, isAuthenticated: true, isExchanging: false })
        } catch (err) {
          set({
            isExchanging: false,
            error: err instanceof Error ? err.message : '로그인에 실패했습니다.',
          })
        }
      },

      logout: () => {
        clearOctokitClient()
        set({ token: null, username: null, avatarUrl: null, isAuthenticated: false, error: null })
      },

      rehydrate: () => {
        const { token } = get()
        if (token) {
          createOctokitClient(token)
        }
      },

      handleAuthError: () => {
        clearOctokitClient()
        set({
          token: null,
          username: null,
          avatarUrl: null,
          isAuthenticated: false,
          error: '세션이 만료되었습니다. 다시 로그인해주세요.',
        })
      },
    }),
    {
      name: 'obsidian-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        avatarUrl: state.avatarUrl,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

setAuthErrorHandler(() => useAuthStore.getState().handleAuthError())
