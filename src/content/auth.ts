const TOKEN_KEY = 'rk-admin-session'

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export async function loginWithPassword(password: string): Promise<void> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    const message =
      response.status === 401
        ? 'Incorrect password'
        : 'Unable to sign in. Try again.'
    throw new Error(message)
  }

  const data = (await response.json()) as { token?: string }
  if (!data.token) {
    throw new Error('Invalid login response')
  }
  setAdminToken(data.token)
}

export function logoutAdmin(): void {
  clearAdminToken()
}
