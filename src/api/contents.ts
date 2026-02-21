import { getOctokitClient } from './github'
import { encodeBase64, decodeBase64 } from '@/utils/base64'
import type { GitHubFile } from '@/types/github'

export class ShaConflictError extends Error {
  constructor(public path: string) {
    super(`파일이 외부에서 수정되었습니다: ${path}`)
    this.name = 'ShaConflictError'
  }
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
): Promise<{ content: string; sha: string }> {
  const octokit = getOctokitClient()
  if (!octokit) throw new Error('인증이 필요합니다.')

  const { data } = await octokit.rest.repos.getContent({ owner, repo, path })
  const file = data as GitHubFile
  if (file.type !== 'file' || !file.content) {
    throw new Error(`${path}은(는) 파일이 아닙니다.`)
  }

  return {
    content: decodeBase64(file.content),
    sha: file.sha,
  }
}

export async function saveFile(params: {
  owner: string
  repo: string
  path: string
  content: string
  sha: string
  message: string
  branch?: string
}): Promise<{ sha: string }> {
  const octokit = getOctokitClient()
  if (!octokit) throw new Error('인증이 필요합니다.')

  if (params.path.startsWith('.obsidian/')) {
    throw new Error('.obsidian/ 디렉토리에는 쓸 수 없습니다.')
  }

  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      message: params.message,
      content: encodeBase64(params.content),
      sha: params.sha,
      branch: params.branch,
    })
    return { sha: (data.content as GitHubFile).sha }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
      throw new ShaConflictError(params.path)
    }
    throw err
  }
}

export async function createFile(params: {
  owner: string
  repo: string
  path: string
  content: string
  message: string
  branch?: string
}): Promise<{ sha: string }> {
  const octokit = getOctokitClient()
  if (!octokit) throw new Error('인증이 필요합니다.')

  if (params.path.startsWith('.obsidian/')) {
    throw new Error('.obsidian/ 디렉토리에는 쓸 수 없습니다.')
  }

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    message: params.message,
    content: encodeBase64(params.content),
    branch: params.branch,
  })
  return { sha: (data.content as GitHubFile).sha }
}

export async function deleteFile(params: {
  owner: string
  repo: string
  path: string
  sha: string
  message: string
  branch?: string
}): Promise<void> {
  const octokit = getOctokitClient()
  if (!octokit) throw new Error('인증이 필요합니다.')

  await octokit.rest.repos.deleteFile({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    sha: params.sha,
    message: params.message,
    branch: params.branch,
  })
}
