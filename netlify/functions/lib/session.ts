import { createHmac, timingSafeEqual } from 'node:crypto'

const TTL_MS = 12 * 60 * 60 * 1000

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error('ADMIN_PASSWORD is not configured')
  }
  return secret
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not configured')
  }
  return password
}

export function passwordsEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export function createSessionToken(secret: string): string {
  const exp = Date.now() + TTL_MS
  const payload = String(exp)
  const sig = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
): boolean {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const exp = Number(payload)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith('Bearer ')) return undefined
  return authorization.slice('Bearer '.length).trim()
}
