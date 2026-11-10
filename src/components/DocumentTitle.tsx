import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'Rhea Khandelwal Psychotherapy'

const titles: Record<string, string> = {
  '/': SITE,
  '/approach': `Approach | ${SITE}`,
  '/about': `About Me | ${SITE}`,
  '/contact': `Contact | ${SITE}`,
  '/privacy': `Privacy Policy | ${SITE}`,
  '/admin': `Home | Admin | ${SITE}`,
  '/admin/approach': `Approach | Admin | ${SITE}`,
  '/admin/about': `About Me | Admin | ${SITE}`,
  '/admin/contact': `Contact | Admin | ${SITE}`,
  '/admin/privacy': `Privacy Policy | Admin | ${SITE}`,
}

export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titles[pathname] ?? SITE
  }, [pathname])

  return null
}
