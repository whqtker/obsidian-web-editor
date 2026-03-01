import { requireOctokit, rethrowWithAuthCheck } from './github'
import { encodeBase64, decodeBase64 } from '@/utils/base64'

export class ShaConflictError extends Error {
  constructor(public path: string) {
    super(`파일이 외부에서 수정되었습니다: ${path}`)
    this.name = 'ShaConflictError'
  }
}

function assertNotObsidian(path: string): void {
  if (path.startsWith('.obsidian/')) {
    throw new Error('.obsidian/ 디렉토리에는 쓸 수 없습니다.')
  }
}

function extractSha(data: { content?: { sha?: string } | null }): string {
  const sha = data.content?.sha
  if (!sha) throw new Error('저장 후 파일 정보를 받지 못했습니다.')
  return sha
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
): Promise<{ content: string; sha: string }> {
  const octokit = requireOctokit()

  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path })
    if (Array.isArray(data) || data.type !== 'file' || data.content === undefined) {
      throw new Error(`${path}은(는) 파일이 아닙니다.`)
    }
    return { content: decodeBase64(data.content), sha: data.sha }
  } catch (err) {
    rethrowWithAuthCheck(err)
  }
}

export async function fetchImageUrl(
  owner: string,
  repo: string,
  path: string,
  branch?: string,
): Promise<{ downloadUrl: string; sha: string }> {
  const octokit = requireOctokit()

  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ...(branch ? { ref: branch } : {}) })
    if (Array.isArray(data) || data.type !== 'file' || !data.download_url) {
      throw new Error(`${path}은(는) 이미지 파일이 아닙니다.`)
    }
    return { downloadUrl: data.download_url, sha: data.sha }
  } catch (err) {
    rethrowWithAuthCheck(err)
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
  const octokit = requireOctokit()
  assertNotObsidian(params.path)

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
    return { sha: extractSha(data) }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
      throw new ShaConflictError(params.path)
    }
    rethrowWithAuthCheck(err)
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
  const octokit = requireOctokit()
  assertNotObsidian(params.path)

  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      message: params.message,
      content: encodeBase64(params.content),
      branch: params.branch,
    })
    return { sha: extractSha(data) }
  } catch (err) {
    rethrowWithAuthCheck(err)
  }
}

export async function uploadBinaryFile(params: {
  owner: string
  repo: string
  path: string
  base64Content: string
  message: string
  branch?: string
}): Promise<{ sha: string }> {
  const octokit = requireOctokit()
  assertNotObsidian(params.path)

  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      message: params.message,
      content: params.base64Content,
      branch: params.branch,
    })
    return { sha: extractSha(data) }
  } catch (err) {
    rethrowWithAuthCheck(err)
  }
}

export async function deleteFile(params: {
  owner: string
  repo: string
  path: string
  sha: string
  message: string
  branch?: string
}): Promise<void> {
  const octokit = requireOctokit()
  assertNotObsidian(params.path)

  try {
    await octokit.rest.repos.deleteFile({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      sha: params.sha,
      message: params.message,
      branch: params.branch,
    })
  } catch (err) {
    rethrowWithAuthCheck(err)
  }
}
