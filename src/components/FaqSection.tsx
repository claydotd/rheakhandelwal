import { useState } from 'react'
import MarkdownContent from './MarkdownContent'
import type { FaqItem } from '../content/types'

type FaqSectionProps = {
  items: FaqItem[]
}

export default function FaqSection({ items }: FaqSectionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  if (items.length === 0) return null

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">FAQ</h2>
      <div className="faq__list">
        {items.map((item) => {
          const isOpen = openIds.has(item.id)
          const questionId = `faq-question-${item.id}`
          const answerId = `faq-answer-${item.id}`

          return (
            <div
              key={item.id}
              className={`faq__item${isOpen ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="faq__question"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(item.id)}
              >
                <span className="faq__toggle" aria-hidden="true" />
                <span className="faq__question-text">{item.question}</span>
              </button>
              <div
                className="faq__panel"
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                aria-hidden={!isOpen}
              >
                <div className="faq__panel-inner">
                  <div className="faq__answer">
                    <MarkdownContent content={item.answer} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
