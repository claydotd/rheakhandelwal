import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function Privacy() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.privacy

  return (
    <article className="page">
      <h1>{page.title}</h1>
      <ContentBlocks blocks={page.blocks} />
    </article>
  )
}
