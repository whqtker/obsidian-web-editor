import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getOctokitClient } from '@/api/github'

interface RepoState {
  owner: string
  repo: string
  branch: string
  branches: string[]
  isValidating: boolean
  error: string | null
}

interface RepoActions {
  setRepo: (owner: string, repo: string) => Promise<void>
  setBranch: (branch: string) => void
  clearRepo: () => void
}

export const useRepoStore = create<RepoState & RepoActions>()(
  persist(
    (set) => ({
      owner: '',
      repo: '',
      branch: 'main',
      branches: [],
      isValidating: false,
      error: null,

      setRepo: async (owner: string, repo: string) => {
        set({ isValidating: true, error: null })
        try {
          const octokit = getOctokitClient()
          if (!octokit) throw new Error('인증이 필요합니다.')

          const { data: repoData } = await octokit.rest.repos.get({ owner, repo })

          const { data: branchList } = await octokit.rest.repos.listBranches({
            owner,
            repo,
            per_page: 100,
          })

          const defaultBranch = repoData.default_branch
          const branches = branchList.map((b) => b.name)

          set({
            owner,
            repo,
            branch: defaultBranch,
            branches,
            isValidating: false,
            error: null,
          })
        } catch (err) {
          set({
            isValidating: false,
            error: err instanceof Error ? err.message : '레포 검증에 실패했습니다.',
          })
          throw err
        }
      },

      setBranch: (branch: string) => {
        set({ branch })
      },

      clearRepo: () => {
        set({
          owner: '',
          repo: '',
          branch: 'main',
          branches: [],
          isValidating: false,
          error: null,
        })
      },
    }),
    {
      name: 'obsidian-repo',
      partialize: (state) => ({
        owner: state.owner,
        repo: state.repo,
        branch: state.branch,
      }),
    },
  ),
)
