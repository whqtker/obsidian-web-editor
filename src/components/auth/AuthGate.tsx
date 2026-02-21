import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PatForm } from './PatForm'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, rehydrate } = useAuthStore()

  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  if (!isAuthenticated) {
    return <PatForm />
  }

  return <>{children}</>
}
