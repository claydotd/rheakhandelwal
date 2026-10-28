import ContactForm from '../components/ContactForm'
import ContentBlocks from '../components/ContentBlocks'
import ContentStatus from '../components/ContentStatus'
import { useSiteContent } from '../content/useSiteContent'

const EMAIL = 'hello@rheakhandelwaltherapy.co.uk'

export default function Contact() {
  const { content, loading, error } = useSiteContent()
  const status = <ContentStatus loading={loading} error={error} />
  if (loading || error || !content) return status

  const page = content.pages.contact

  return (
    <article className="page contact-page">
      <h1>{page.title}</h1>
      <a className="contact-page__email" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      <div className="contact-page__layout">
        <div className="contact-page__content">
          <ContentBlocks blocks={page.blocks} />
        </div>
        <div className="contact-page__form">
          <ContactForm />
        </div>
      </div>
    </article>
  )
}
