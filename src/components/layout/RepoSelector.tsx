import { useState, useEffect, useMemo } from 'react'
import { useRepoStore } from '@/store/repoStore'
import { Spinner } from '@/components/ui/Spinner'

export function RepoSelector() {
  const {
    owner, repo, branch, branches,
    isValidating, error,
    userRepos, isLoadingRepos, reposError,
    setRepo, setBranch, clearRepo, fetchUserRepos,
  } = useRepoStore()

  const [search, setSearch] = useState('')
  const isConfigured = owner && repo

  useEffect(() => {
    if (!isConfigured && userRepos.length === 0 && !isLoadingRepos) {
      fetchUserRepos()
    }
  }, [isConfigured, userRepos.length, isLoadingRepos, fetchUserRepos])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return userRepos
    return userRepos.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false),
    )
  }, [userRepos, search])

  if (isConfigured) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 font-mono">{owner}/{repo}</span>
          <button
            onClick={clearRepo}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            변경
          </button>
        </div>
        {branches.length > 1 && (
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <p className="text-sm font-medium text-gray-300">Vault 레포 설정</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="레포 검색..."
        className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoFocus
      />

      {isLoadingRepos && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {reposError && <p className="text-red-400 text-xs">{reposError}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {!isLoadingRepos && (
        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700 rounded border border-gray-700">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray-500">레포가 없습니다.</li>
          ) : (
            filtered.map((r) => (
              <li key={r.fullName}>
                <button
                  onClick={() => setRepo(r.owner, r.name)}
                  disabled={isValidating}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono">{r.fullName}</span>
                    {r.private && (
                      <span className="text-xs text-gray-500 border border-gray-600 rounded px-1">private</span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{r.description}</p>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {isValidating && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Spinner size="sm" /> 연결 중...
        </div>
      )}
    </div>
  )
}
