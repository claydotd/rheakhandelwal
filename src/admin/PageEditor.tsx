import { useState } from 'react'
import type { PageContent, PageKey, SiteContent } from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import BlocksEditor from './BlocksEditor'
import './admin.css'

type EditablePageKey = Exclude<PageKey, 'home'>

type PageEditorProps = {
  pageKey: EditablePageKey
}

export default function PageEditor({ pageKey }: PageEditorProps) {
  const { content, loading, error, save, uploadImage } = useSiteContent()
  const [draft, setDraft] = useState<PageContent | null>(null)
  const [sourceContent, setSourceContent] = useState<SiteContent | null>(null)
  const [sourceKey, setSourceKey] = useState<EditablePageKey | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'ok' | 'error' | null>(null)
  const [saving, setSaving] = useState(false)

  if (content && (sourceContent !== content || sourceKey !== pageKey)) {
    setSourceContent(content)
    setSourceKey(pageKey)
    setDraft(structuredClone(content.pages[pageKey]))
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>
  if (!content || !draft) return null

  const pageDraft = draft
  const siteContent = content

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    setStatusKind(null)
    try {
      const next = structuredClone(siteContent)
      next.pages[pageKey] = pageDraft
      await save(next)
      setStatus('Saved')
      setStatusKind('ok')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed')
      setStatusKind('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-field">
        <label htmlFor={`${pageKey}-title`}>Title</label>
        <input
          id={`${pageKey}-title`}
          value={pageDraft.title}
          onChange={(e) => setDraft({ ...pageDraft, title: e.target.value })}
        />
      </div>

      <BlocksEditor
        blocks={pageDraft.blocks}
        onChange={(blocks) => setDraft({ ...pageDraft, blocks })}
        uploadImage={uploadImage}
        onError={(message) => {
          setStatus(message)
          setStatusKind('error')
        }}
      />

      <div className="admin-actions">
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
