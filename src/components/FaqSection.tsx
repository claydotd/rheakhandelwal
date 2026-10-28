import MarkdownContent from './MarkdownContent'
import type { FaqItem } from '../content/types'

type FaqSectionProps = {
  items: FaqItem[]
}

export default function FaqSection({ items }: FaqSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">FAQ</h2>
      <div className="faq__list">
        {items.map((item) => (
          <details key={item.id} className="faq__item">
            <summary className="faq__question">
              <span className="faq__question-text">{item.question}</span>
              <span className="faq__toggle" aria-hidden="true" />
            </summary>
            <div className="faq__answer">
              <MarkdownContent content={item.answer} />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
