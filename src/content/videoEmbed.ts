/** Extract a YouTube video id from common URL shapes, or a bare 11-char id. */
export function youtubeVideoId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id && /^[\w-]{11}$/.test(id) ? id : null
      }
      const embedMatch = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)
      if (embedMatch) return embedMatch[1]
    }
  } catch {
    return null
  }

  return null
}

/** Privacy-enhanced YouTube embed URL, or null if the input is not recognised. */
export function youtubeEmbedSrc(url: string): string | null {
  const id = youtubeVideoId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}
