import { AuthGate } from '@/components/auth/AuthGate'
import { useAuthStore } from '@/store/authStore'

function Dashboard() {
  const { username, logout } = useAuthStore()

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
      <p className="text-xl">Logged in as <span className="font-bold">{username}</span></p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
      >
        로그아웃
      </button>
    </div>
  )
}

function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}

export default App
