export type ContentBackend = 'local' | 'netlify'

export function getContentBackend(): ContentBackend {
  const value = import.meta.env.VITE_CONTENT_BACKEND
  return value === 'netlify' ? 'netlify' : 'local'
}

export function isLocalBackend(): boolean {
  return getContentBackend() === 'local'
}
