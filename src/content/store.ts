import { getAdminToken } from './auth'
import { getContentBackend } from './backend'
import { normalizeSiteContent } from './normalize'
import type { SiteContent } from './types'

const LOCAL_STORAGE_KEY = 'rk-site-content'

function seedUrl(): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}content/site.json`
}

async function fetchSeed(): Promise<SiteContent> {
  const response = await fetch(seedUrl())
  if (!response.ok) {
    throw new Error('Failed to load site content seed')
  }
  return (await response.json()) as SiteContent
}

function readLocalOverlay(): SiteContent | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SiteContent
  } catch {
    return null
  }
}

function writeLocalOverlay(content: SiteContent): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content))
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image'))
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

async function getLocalContent(): Promise<SiteContent> {
  return readLocalOverlay() ?? (await fetchSeed())
}

async function writeSeedFiles(content: SiteContent): Promise<void> {
  // Only available while `npm run dev` is running (Vite seedWritePlugin).
  try {
    const response = await fetch('/__seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
    if (!response.ok) {
      throw new Error('Seed write failed')
    }
  } catch {
    // Preview / GitHub Pages have no write endpoint; localStorage still holds the edit.
  }
}

async function saveLocalContent(content: SiteContent): Promise<void> {
  writeLocalOverlay(content)
  await writeSeedFiles(content)
}

async function uploadLocalImage(file: File): Promise<string> {
  return fileToDataUrl(file)
}

function authHeaders(): HeadersInit {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function getNetlifyContent(): Promise<SiteContent> {
  const response = await fetch('/api/content')
  if (!response.ok) {
    throw new Error('Failed to load site content')
  }
  return (await response.json()) as SiteContent
}

async function saveNetlifyContent(content: SiteContent): Promise<void> {
  const response = await fetch('/api/content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(content),
  })
  if (response.status === 401) {
    throw new Error('Session expired. Sign in again.')
  }
  if (!response.ok) {
    throw new Error('Failed to save site content')
  }
}

async function uploadNetlifyImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const response = await fetch('/api/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({
      contentType: file.type || 'application/octet-stream',
      dataUrl,
    }),
  })
  if (response.status === 401) {
    throw new Error('Session expired. Sign in again.')
  }
  if (!response.ok) {
    throw new Error('Failed to upload image')
  }
  const data = (await response.json()) as { src?: string }
  if (!data.src) {
    throw new Error('Invalid upload response')
  }
  return data.src
}

export async function getSiteContent(): Promise<SiteContent> {
  const content =
    getContentBackend() === 'netlify'
      ? await getNetlifyContent()
      : await getLocalContent()
  return normalizeSiteContent(content)
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (getContentBackend() === 'netlify') {
    await saveNetlifyContent(content)
  } else {
    await saveLocalContent(content)
  }
}

export async function uploadImage(file: File): Promise<string> {
  return getContentBackend() === 'netlify'
    ? uploadNetlifyImage(file)
    : uploadLocalImage(file)
}

export function clearLocalContentOverlay(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}
