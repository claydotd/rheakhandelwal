import { useContext } from 'react'
import { ContentContext } from './ContentContext'

export function useSiteContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) {
    throw new Error('useSiteContent must be used within ContentProvider')
  }
  return ctx
}
