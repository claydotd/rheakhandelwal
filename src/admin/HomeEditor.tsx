import { useState } from 'react'
import type { HomePageContent, SiteContent } from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import BlocksEditor from './BlocksEditor'
import './admin.css'

export default function HomeEditor() {
  const { content, loading, error, save, uploadImage } = useSiteContent()
  const [draft, setDraft] = useState<HomePageContent | null>(null)
  const [sourceContent, setSourceContent] = useState<SiteContent | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'ok' | 'error' | null>(null)
  const [saving, setSaving] = useState(false)

  if (content && sourceContent !== content) {
    setSourceContent(content)
    setDraft(structuredClone(content.pages.home))
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>
  if (!content || !draft) return null

  const homeDraft = draft
  const siteContent = content

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    setStatusKind(null)
    try {
      const next = structuredClone(siteContent)
      next.pages.home = homeDraft
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
        <label htmlFor="home-title">Title</label>
        <input
          id="home-title"
          value={homeDraft.title}
          onChange={(e) => setDraft({ ...homeDraft, title: e.target.value })}
        />
      </div>

      <BlocksEditor
        blocks={homeDraft.blocks}
        onChange={(blocks) => setDraft({ ...homeDraft, blocks })}
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
