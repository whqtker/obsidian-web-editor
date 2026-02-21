import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { OAuthLoginScreen } from './PatForm'
import { Spinner } from '@/components/ui/Spinner'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isExchanging, handleOAuthCallback, rehydrate } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (code && state) {
      window.history.replaceState({}, '', window.location.pathname)
      handleOAuthCallback(code, state)
    } else {
      rehydrate()
    }
  }, [handleOAuthCallback, rehydrate])

  if (isExchanging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Spinner size="md" label="GitHub 인증 중..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <OAuthLoginScreen />
  }

  return <>{children}</>
}
