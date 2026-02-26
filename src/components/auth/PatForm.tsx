import { useAuthStore } from '@/store/authStore'

export function OAuthLoginScreen() {
  const { initiateOAuth, error } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 overflow-hidden relative">
      {/* 배경 글로우 */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[20%] w-[500px] h-[300px] rounded-full bg-purple-700/15 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* 카드 */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-12 py-16 backdrop-blur-sm flex flex-col items-center">
          {/* 옵시디언 로고 */}
          <img src="/obsidian-icon.svg" alt="Obsidian" width="64" height="64" className="mb-20" />

          <h1 className="text-2xl font-bold text-white tracking-tight mb-8">
            Obsidian Web Editor
          </h1>
          <p className="text-gray-400 text-sm mb-20 leading-relaxed">
            GitHub 계정으로 로그인하여 vault에 연결합니다.
          </p>

          {error && (
            <p className="text-red-400 text-sm mb-12 bg-red-400/10 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* GitHub 로그인 버튼 */}
          <button
            onClick={initiateOAuth}
            className="w-full inline-flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Login with GitHub
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 w-full my-20">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">기능</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* 기능 하이라이트 */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-gray-800/50 rounded-xl py-5 px-3 flex flex-col items-center justify-center gap-3">
              <span className="text-lg">✎</span>
              <span className="text-xs text-gray-400">마크다운 편집</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl py-5 px-3 flex flex-col items-center justify-center gap-3">
              <span className="text-lg">⟳</span>
              <span className="text-xs text-gray-400">GitHub 동기화</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl py-5 px-3 flex flex-col items-center justify-center gap-3">
              <span className="text-lg">◉</span>
              <span className="text-xs text-gray-400">실시간 미리보기</span>
            </div>
          </div>

          <p className="mt-20 text-xs text-gray-600">
            필요 권한: <code className="text-gray-500 font-mono">repo</code>
          </p>
        </div>
      </div>
    </div>
  )
}
