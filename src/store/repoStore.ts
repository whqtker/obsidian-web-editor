import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getOctokitClient } from '@/api/github'
import type { UserRepo } from '@/types/github'

interface RepoState {
  owner: string
  repo: string
  branch: string
  branches: string[]
  isValidating: boolean
  error: string | null
  userRepos: UserRepo[]
  isLoadingRepos: boolean
  reposError: string | null
}

interface RepoActions {
  setRepo: (owner: string, repo: string) => Promise<void>
  setBranch: (branch: string) => void
  clearRepo: () => void
  fetchUserRepos: () => Promise<void>
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
      userRepos: [],
      isLoadingRepos: false,
      reposError: null,

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

      fetchUserRepos: async () => {
        const octokit = getOctokitClient()
        if (!octokit) return

        set({ isLoadingRepos: true, reposError: null })
        try {
          const repos = await octokit.paginate(
            octokit.rest.repos.listForAuthenticatedUser,
            { sort: 'updated', per_page: 100, affiliation: 'owner,collaborator' },
            (response, done) => {
              if (response.data.length < 100) done()
              return response.data
            },
          )

          set({
            userRepos: repos.slice(0, 500).map((r) => ({
              owner: r.owner.login,
              name: r.name,
              fullName: r.full_name,
              private: r.private,
              updatedAt: r.updated_at ?? '',
              description: r.description ?? null,
            })),
            isLoadingRepos: false,
          })
        } catch (err) {
          set({
            isLoadingRepos: false,
            reposError: err instanceof Error ? err.message : '레포 목록을 불러올 수 없습니다.',
          })
        }
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
