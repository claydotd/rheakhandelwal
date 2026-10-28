import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getSiteContent, saveSiteContent, uploadImage } from './store'
import type { SiteContent } from './types'

export type ContentContextValue = {
  content: SiteContent | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  save: (next: SiteContent) => Promise<void>
  uploadImage: (file: File) => Promise<string>
}

export const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await getSiteContent()
      setContent(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (next: SiteContent) => {
    await saveSiteContent(next)
    setContent(next)
  }, [])

  const value: ContentContextValue = {
    content,
    loading,
    error,
    reload,
    save,
    uploadImage,
  }

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  )
}
