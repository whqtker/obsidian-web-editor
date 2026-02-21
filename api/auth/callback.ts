import type { VercelRequest, VercelResponse } from '@vercel/node'

interface GitHubTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
  error_uri?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'missing_code', error_description: 'Authorization code is required' })
  }

  const clientId = process.env.VITE_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'misconfigured', error_description: 'OAuth credentials not configured' })
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const data = (await response.json()) as GitHubTokenResponse

    if (data.error || !data.access_token) {
      return res.status(400).json({
        error: data.error ?? 'token_exchange_failed',
        error_description: data.error_description,
      })
    }

    return res.status(200).json({ access_token: data.access_token })
  } catch {
    return res.status(500).json({ error: 'internal_error', error_description: 'Failed to exchange authorization code' })
  }
}
