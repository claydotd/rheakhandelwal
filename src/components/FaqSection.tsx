import { useState } from 'react'
import MarkdownContent from './MarkdownContent'
import type { FaqItem } from '../content/types'

type FaqSectionProps = {
  items: FaqItem[]
  heading?: string
  subheading?: string
  headingId?: string
}

export default function FaqSection({
  items,
  heading = '',
  subheading = '',
  headingId = 'faq-heading',
}: FaqSectionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const visibleItems = items.filter(
    (item) => item.question.trim() || item.answer.trim(),
  )
  if (visibleItems.length === 0) return null

  const headingText = heading.trim()
  const subheadingText = subheading.trim()
  const hasHeading = headingText.length > 0
  const hasSubheading = subheadingText.length > 0

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="faq" {...(hasHeading ? { 'aria-labelledby': headingId } : {})}>
      {hasHeading || hasSubheading ? (
        <div className="faq__header">
          {hasHeading ? <h2 id={headingId}>{headingText}</h2> : null}
          {hasSubheading ? (
            <p className="faq__subheading">{subheadingText}</p>
          ) : null}
        </div>
      ) : null}
      <div className="faq__list">
        {visibleItems.map((item) => {
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
    </div>
  )
}
