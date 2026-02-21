import { useState } from 'react'
import { useRepoStore } from '@/store/repoStore'

export function RepoSelector() {
  const { owner, repo, branch, branches, isValidating, error, setRepo, setBranch, clearRepo } =
    useRepoStore()
  const isConfigured = owner && repo

  const [inputOwner, setInputOwner] = useState(owner)
  const [inputRepo, setInputRepo] = useState(repo)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputOwner.trim() || !inputRepo.trim()) return
    try {
      await setRepo(inputOwner.trim(), inputRepo.trim())
    } catch {
      // error handled by store
    }
  }

  if (isConfigured) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 font-mono">
            {owner}/{repo}
          </span>
          <button
            onClick={clearRepo}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            변경
          </button>
        </div>
        {branches.length > 1 && (
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-gray-800 rounded-lg">
      <p className="text-sm font-medium text-gray-300">Vault 레포 설정</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputOwner}
          onChange={(e) => setInputOwner(e.target.value)}
          placeholder="owner"
          className="flex-1 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isValidating}
        />
        <span className="text-gray-500 self-center">/</span>
        <input
          type="text"
          value={inputRepo}
          onChange={(e) => setInputRepo(e.target.value)}
          placeholder="repo"
          className="flex-1 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isValidating}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={isValidating || !inputOwner.trim() || !inputRepo.trim()}
        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded transition-colors"
      >
        {isValidating ? '검증 중...' : '연결'}
      </button>
    </form>
  )
}
