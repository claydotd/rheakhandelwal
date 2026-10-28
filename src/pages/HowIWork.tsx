import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import FaqSection from '../components/FaqSection'
import { useSiteContent } from '../content/useSiteContent'

export default function HowIWork() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.howIWork

  return (
    <article className="page">
      <ContentBlocks blocks={page.blocks} />
      <FaqSection items={content.faq} />
    </article>
  )
}
