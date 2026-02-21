import { getOctokitClient } from './github'
import type { GitHubTreeNode, GitHubTreeResponse } from '@/types/github'

export async function fetchFullTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<{ nodes: GitHubTreeNode[]; truncated: boolean }> {
  const octokit = getOctokitClient()
  if (!octokit) throw new Error('인증이 필요합니다.')

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  })

  const commitSha = ref.object.sha

  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: commitSha,
    recursive: 'true',
  }) as { data: GitHubTreeResponse }

  return {
    nodes: data.tree,
    truncated: data.truncated,
  }
}
