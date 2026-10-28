import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function Fees() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.fees

  return (
    <article className="page">
      <ContentBlocks blocks={page.blocks} />
    </article>
  )
}
