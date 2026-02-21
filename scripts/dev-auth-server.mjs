/**
 * Local dev stub for the Vercel serverless function api/auth/callback.ts
 * Runs on port 3001 and proxied via vite dev server at /api/auth/callback
 *
 * Usage: node scripts/dev-auth-server.mjs
 * Requires .env.local with VITE_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
 */

import http from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load .env.local manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

try {
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    process.env[key] = value
  }
} catch {
  console.error('Warning: Could not read .env.local — set VITE_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET manually')
}

const CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const PORT = 3001

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: VITE_GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set')
  process.exit(1)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname !== '/api/auth/callback') {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'not_found' }))
    return
  }

  const code = url.searchParams.get('code')

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'missing_code' }))
    return
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    })

    const data = await response.json()

    if (data.error || !data.access_token) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: data.error ?? 'token_exchange_failed', error_description: data.error_description }))
      return
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
    })
    res.end(JSON.stringify({ access_token: data.access_token }))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'internal_error', error_description: String(err) }))
  }
})

server.listen(PORT, () => {
  console.log(`Dev auth server running at http://localhost:${PORT}`)
  console.log(`Client ID: ${CLIENT_ID}`)
})
