import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

export default function Home() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.home
  const heroPlacement = page.heroPlacement === 'under' ? 'under' : 'below'

  return (
    <article className={`page home-page home-page--hero-${heroPlacement}`}>
      {page.heroImage?.src ? (
        <figure className="home-hero">
          <img src={page.heroImage.src} alt={page.heroImage.alt || ''} />
        </figure>
      ) : null}

      <div className="home-intro">
        <h1>{page.title}</h1>
      </div>

      <ContentBlocks blocks={page.blocks} />
    </article>
  )
}
