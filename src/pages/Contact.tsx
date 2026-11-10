import ContentSections from '../components/ContentSections'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function Contact() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.contact

  return (
    <article className="page contact-page">
      <h1>{page.title}</h1>
      <ContentSections sections={page.sections} />
    </article>
  )
}
