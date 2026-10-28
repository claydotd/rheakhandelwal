import { useState } from 'react'
import type { FaqItem, SiteContent } from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import MarkdownEditor from './MarkdownEditor'
import { newId } from './newId'
import './admin.css'

export default function FaqEditor() {
  const { content, loading, error, save } = useSiteContent()
  const [draft, setDraft] = useState<FaqItem[] | null>(null)
  const [sourceContent, setSourceContent] = useState<SiteContent | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'ok' | 'error' | null>(null)
  const [saving, setSaving] = useState(false)

  if (content && sourceContent !== content) {
    setSourceContent(content)
    setDraft(structuredClone(content.faq))
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>
  if (!content || !draft) return null

  const faqDraft = draft
  const siteContent = content

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    setStatusKind(null)
    try {
      await save({ ...siteContent, faq: faqDraft })
      setStatus('Saved')
      setStatusKind('ok')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed')
      setStatusKind('error')
    } finally {
      setSaving(false)
    }
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= faqDraft.length) return
    const next = [...faqDraft]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setDraft(next)
  }

  return (
    <div className="admin-panel">
      <div className="admin-faq-list">
        {faqDraft.map((item, index) => (
          <div key={item.id} className="admin-faq-card">
            <div className="admin-field">
              <label htmlFor={`${item.id}-q`}>Question</label>
              <input
                id={`${item.id}-q`}
                value={item.question}
                onChange={(e) => {
                  const next = [...faqDraft]
                  next[index] = { ...item, question: e.target.value }
                  setDraft(next)
                }}
              />
            </div>
            <MarkdownEditor
              id={`${item.id}-a`}
              label="Answer"
              value={item.answer}
              onChange={(answer) => {
                const next = [...faqDraft]
                next[index] = { ...item, answer }
                setDraft(next)
              }}
            />
            <div className="admin-faq-card__actions">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={index === faqDraft.length - 1}
                onClick={() => moveItem(index, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft(faqDraft.filter((entry) => entry.id !== item.id))
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button
          type="button"
          onClick={() =>
            setDraft([
              ...faqDraft,
              {
                id: newId('faq'),
                question: 'New question',
                answer: 'New answer',
              },
            ])
          }
        >
          + Add Question
        </button>
        <button
          type="button"
          className="primary"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {status ? (
          <p
            className={`admin-status${statusKind === 'error' ? ' admin-status--error' : ''}${statusKind === 'ok' ? ' admin-status--ok' : ''}`}
            role="status"
          >
            {status}
          </p>
        ) : null}
      </div>
    </div>
  )
}
