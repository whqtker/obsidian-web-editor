import { Octokit } from 'octokit'

let octokitInstance: Octokit | null = null

export function createOctokitClient(token: string): Octokit {
  octokitInstance = new Octokit({ auth: token })
  return octokitInstance
}

export function getOctokitClient(): Octokit | null {
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
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string
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
