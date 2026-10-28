import type { Handler } from '@netlify/functions'
import { json, noContent } from './lib/http'
import {
  createSessionToken,
  getAdminPassword,
  getSessionSecret,
  passwordsEqual,
} from './lib/session'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return noContent()
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const body = JSON.parse(event.body || '{}') as { password?: string }
    const password = body.password ?? ''
    const expected = getAdminPassword()

    if (!passwordsEqual(password, expected)) {
      return json(401, { error: 'Incorrect password' })
    }

    const token = createSessionToken(getSessionSecret())
    return json(200, { token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    const status = message.includes('ADMIN_PASSWORD') ? 500 : 400
    return json(status, { error: message })
  }
}
