import ContentSections from '../components/ContentSections'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function AboutMe() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.about

  return (
    <article className="page">
      <ContentSections sections={page.sections} />
    </article>
  )
}
