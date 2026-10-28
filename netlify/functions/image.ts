import { getStore } from '@netlify/blobs'
import type { Handler } from '@netlify/functions'
import { randomUUID } from 'node:crypto'
import { binary, json, noContent } from './lib/http'
import {
  bearerToken,
  getSessionSecret,
  verifySessionToken,
} from './lib/session'

type ImageMeta = {
  contentType: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return noContent()
  }

  const store = getStore('site-images')

  if (event.httpMethod === 'GET') {
    const key = event.queryStringParameters?.key
    if (!key) {
      return json(400, { error: 'Missing key' })
    }

    const [data, metaRaw] = await Promise.all([
      store.get(key, { type: 'arrayBuffer' }),
      store.get(`${key}:meta`, { type: 'json' }),
    ])

    if (!data) {
      return json(404, { error: 'Not found' })
    }

    const meta = (metaRaw as ImageMeta | null) ?? {
      contentType: 'application/octet-stream',
    }
    return binary(200, Buffer.from(data), meta.contentType)
  }

  if (event.httpMethod === 'POST') {
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
      const body = JSON.parse(event.body || '{}') as {
        contentType?: string
        dataUrl?: string
      }
      if (!body.dataUrl?.startsWith('data:')) {
        return json(400, { error: 'Expected dataUrl' })
      }

      const comma = body.dataUrl.indexOf(',')
      if (comma < 0) {
        return json(400, { error: 'Invalid dataUrl' })
      }

      const header = body.dataUrl.slice(0, comma)
      const payload = body.dataUrl.slice(comma + 1)
      const contentType =
        body.contentType ||
        header.match(/^data:([^;]+)/)?.[1] ||
        'application/octet-stream'
      const buffer = Buffer.from(payload, 'base64')
      const key = randomUUID()

      await store.set(key, buffer, {
        metadata: { contentType },
      })
      await store.setJSON(`${key}:meta`, { contentType } satisfies ImageMeta)

      return json(200, { src: `/api/image?key=${encodeURIComponent(key)}` })
    } catch {
      return json(400, { error: 'Invalid upload payload' })
    }
  }

  return json(405, { error: 'Method not allowed' })
}
