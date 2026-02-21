import { create } from 'zustand'
import { fetchFullTree } from '@/api/tree'
import { buildTreeFromFlat } from '@/utils/pathUtils'
import type { GitHubTreeNode } from '@/types/github'
import type { TreeNode } from '@/types/obsidian'

interface TreeState {
  flatNodes: GitHubTreeNode[]
  tree: TreeNode[]
  isLoading: boolean
  error: string | null
  truncated: boolean
}

interface TreeActions {
  fetchTree: (owner: string, repo: string, branch: string) => Promise<void>
  invalidate: () => void
}

export const useTreeStore = create<TreeState & TreeActions>()((set) => ({
  flatNodes: [],
  tree: [],
  isLoading: false,
  error: null,
  truncated: false,

  fetchTree: async (owner, repo, branch) => {
    set({ isLoading: true, error: null })
    try {
      const { nodes, truncated } = await fetchFullTree(owner, repo, branch)
      const tree = buildTreeFromFlat(nodes)
      set({ flatNodes: nodes, tree, isLoading: false, truncated })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : '파일 트리를 불러올 수 없습니다.',
      })
    }
  },

  invalidate: () => {
    set({ flatNodes: [], tree: [] })
  },
}))
