import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

const SEED_PATHS = [
  'public/content/site.json',
  'netlify/functions/lib/default-site.json',
] as const

function writeSeedFiles(root: string, body: string): void {
  const parsed = JSON.parse(body) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Seed body must be a JSON object')
  }
  const record = parsed as Record<string, unknown>
  if (!record.pages || typeof record.pages !== 'object') {
    throw new Error('Seed body must include a pages object')
  }
  const pretty = `${JSON.stringify(parsed, null, 2)}\n`
  for (const relative of SEED_PATHS) {
    const target = path.join(root, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, pretty, 'utf8')
  }
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

/** Dev-only: POST /__seed writes local CMS content into committed seed files. */
export function seedWritePlugin(): Plugin {
  let root = process.cwd()

  return {
    name: 'seed-write',
    apply: 'serve',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/__seed' || req.method !== 'POST') {
          next()
          return
        }

        try {
          const body = await readBody(req)
          writeSeedFiles(root, body)
          res.statusCode = 204
          res.end()
        } catch (err) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Failed to write seed',
            }),
          )
        }
      })
    },
  }
}
