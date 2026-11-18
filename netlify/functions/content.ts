import { connectLambda, getStore } from '@netlify/blobs'
import type { Handler } from '@netlify/functions'
import defaultSite from './lib/default-site.json'
import { json, noContent } from './lib/http'
import {
  bearerToken,
  getSessionSecret,
  verifySessionToken,
} from './lib/session'

const CONTENT_KEY = 'site-content'

export const handler: Handler = async (event) => {
  // Classic Lambda-style handlers need this before getStore().
  connectLambda(event)

  if (event.httpMethod === 'OPTIONS') {
    return noContent()
  }

  const store = getStore('site-content')

  if (event.httpMethod === 'GET') {
    const stored = await store.get(CONTENT_KEY, { type: 'json' })
    // Short CDN/browser cache; admin saves should show within ~a minute.
    return json(200, stored ?? defaultSite, {
      'Cache-Control':
        'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
    })
  }

  if (event.httpMethod === 'PUT') {
    const token = bearerToken(event.headers.authorization)
    let secret: string
    try {
      secret = getSessionSecret()
    } catch {
      return json(500, { error: 'ADMIN_PASSWORD is not configured' })
    }

    if (!verifySessionToken(token, secret)) {
      return json(401, { error: 'Unauthorized' })
    }

    try {
      const body = JSON.parse(event.body || '{}')
      if (body?.version !== 1 || !body?.pages || !body?.footer) {
        return json(400, { error: 'Invalid content payload' })
      }
      await store.setJSON(CONTENT_KEY, body)
      return json(200, { ok: true })
    } catch {
      return json(400, { error: 'Invalid JSON body' })
    }
  }

  return json(405, { error: 'Method not allowed' })
}
