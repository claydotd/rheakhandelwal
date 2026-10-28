import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function AboutMe() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.about

  return (
    <article className="page">
      <ContentBlocks blocks={page.blocks} />
    </article>
  )
}
