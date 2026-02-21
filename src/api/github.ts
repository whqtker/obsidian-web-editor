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

export async function validateToken(token: string): Promise<{
  login: string
  avatarUrl: string
}> {
  const octokit = new Octokit({ auth: token })
  const { data } = await octokit.rest.users.getAuthenticated()
  return {
    login: data.login,
    avatarUrl: data.avatar_url,
  }
}
