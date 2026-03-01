import { requireOctokit, rethrowWithAuthCheck } from './github'
import type { GitHubTreeNode, GitHubTreeResponse } from '@/types/github'

export async function fetchFullTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<{ nodes: GitHubTreeNode[]; truncated: boolean }> {
  const octokit = requireOctokit()

  try {
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      headers: { 'If-None-Match': '' },
    })

    const commitSha = ref.object.sha

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: 'true',
    })
    const treeData = data as GitHubTreeResponse

    return {
      nodes: treeData.tree,
      truncated: treeData.truncated,
    }
  } catch (err) {
    rethrowWithAuthCheck(err)
  }
}
