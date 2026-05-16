// Thin wrapper around the backend's NIS auth proxy. The actual token
// exchange runs server-side; the browser just sees a session cookie or
// an opaque "logged in" state.

const BASE = '/api/auth'

export interface LoginResult {
  user: {
    id: string
    name?: string | null
  } | null
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
}

export async function me(): Promise<LoginResult> {
  const res = await fetch(`${BASE}/me`)
  if (!res.ok) return { user: null }
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/logout`, { method: 'POST' })
}
