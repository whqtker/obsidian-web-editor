import { Octokit } from 'octokit'

let octokitInstance: Octokit | null = null
let authErrorHandler: (() => void) | null = null

export function setAuthErrorHandler(handler: () => void): void {
  authErrorHandler = handler
}

export function rethrowWithAuthCheck(err: unknown): never {
  if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
    authErrorHandler?.()
  }
  throw err
}

export function createOctokitClient(token: string): Octokit {
  octokitInstance = new Octokit({ auth: token })
  return octokitInstance
}

export function getOctokitClient(): Octokit | null {
  return octokitInstance
}

export function requireOctokit(): Octokit {
  if (!octokitInstance) throw new Error('인증이 필요합니다.')
  return octokitInstance
}

export function clearOctokitClient(): void {
  octokitInstance = null
}

export async function fetchAuthenticatedUser(token: string): Promise<{
  login: string
  avatarUrl: string
}> {
  const octokit = new Octokit({ auth: token })
  const { data } = await octokit.rest.users.getAuthenticated()
  return { login: data.login, avatarUrl: data.avatar_url }
}

export function buildOAuthUrl(state: string): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  if (!clientId) throw new Error('VITE_GITHUB_CLIENT_ID가 설정되지 않았습니다.')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: window.location.origin,
    scope: 'repo',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`)
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string }

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? '토큰 교환에 실패했습니다.')
  }

  return data.access_token
}
