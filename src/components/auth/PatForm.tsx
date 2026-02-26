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
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-12 py-14 text-center backdrop-blur-sm">
          {/* 옵시디언 로고 */}
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gray-800 border border-gray-700 mb-10 p-3.5">
            <svg width="36" height="36" viewBox="0 0 512 512" fill="none">
              <path d="M377.5 291.1c-5.7-2.3-12.2-.8-16.2 3.8l-30.1 34.7c-3.5 4-9.1 5.7-14.3 4.3l-57.4-15.3c-4.6-1.2-9.5.3-12.8 3.9l-42.4 46.5c-2.1 2.3-5 3.7-8.1 3.9l-76.3 4.6c-5.2.3-10-2.5-12.3-7.2L68.8 289c-1.7-3.5-1.5-7.6.6-10.9l50.2-79.5c2.3-3.7 2.5-8.3.5-12.1L91.4 130c-2.4-4.6-1.7-10.2 1.8-14l69.5-75c3.1-3.3 7.6-4.8 12-4l82.8 15.5c4.6.9 9.3-.7 12.5-4.1l47.3-50.3c3.8-4 9.5-5.3 14.6-3.3l70.1 27.5c4.3 1.7 7.4 5.5 8.2 10l20.8 120.7c.7 3.8-.3 7.8-2.7 10.8l-32.8 41c-2.7 3.4-3.5 7.9-2.1 12l21.2 62.5c1.7 5 .3 10.5-3.5 13.9l-36.9 32.7c-3.2 2.9-7.8 3.8-11.9 2.3z" fill="#7C3AED" />
              <path d="M377.5 291.1c-5.7-2.3-12.2-.8-16.2 3.8l-30.1 34.7c-3.5 4-9.1 5.7-14.3 4.3l-57.4-15.3c-4.6-1.2-9.5.3-12.8 3.9l-42.4 46.5c-2.1 2.3-5 3.7-8.1 3.9l-76.3 4.6c-5.2.3-10-2.5-12.3-7.2L68.8 289c-1.7-3.5-1.5-7.6.6-10.9l50.2-79.5c2.3-3.7 2.5-8.3.5-12.1L91.4 130c-2.4-4.6-1.7-10.2 1.8-14l69.5-75c3.1-3.3 7.6-4.8 12-4l82.8 15.5c4.6.9 9.3-.7 12.5-4.1l47.3-50.3c3.8-4 9.5-5.3 14.6-3.3l70.1 27.5c4.3 1.7 7.4 5.5 8.2 10l20.8 120.7c.7 3.8-.3 7.8-2.7 10.8l-32.8 41c-2.7 3.4-3.5 7.9-2.1 12l21.2 62.5c1.7 5 .3 10.5-3.5 13.9l-36.9 32.7c-3.2 2.9-7.8 3.8-11.9 2.3z" fill="url(#obsidian-shine)" fillOpacity="0.3" />
              <defs>
                <linearGradient id="obsidian-shine" x1="68" y1="0" x2="440" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A78BFA" />
                  <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-4">
            Obsidian Web Editor
          </h1>
          <p className="text-gray-400 text-sm mb-12 leading-relaxed">
            GitHub 계정으로 로그인하여 vault에 연결합니다.
          </p>

          {error && (
            <p className="text-red-400 text-sm mb-6 bg-red-400/10 rounded-lg px-4 py-2">
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
          <div className="flex items-center gap-3 my-10">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">기능</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* 기능 하이라이트 */}
          <div className="grid grid-cols-3 gap-4">
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

          <p className="mt-10 text-xs text-gray-600">
            필요 권한: <code className="text-gray-500 font-mono">repo</code>
          </p>
        </div>
      </div>
    </div>
  )
}
