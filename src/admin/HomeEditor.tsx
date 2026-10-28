import { useState } from 'react'
import type { HomePageContent, SiteContent } from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import BlocksEditor from './BlocksEditor'
import { newId } from './newId'
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

  async function handleHeroUpload(file: File | undefined) {
    if (!file) return
    try {
      const src = await uploadImage(file)
      setDraft({
        ...homeDraft,
        heroImage: {
          id: homeDraft.heroImage?.id ?? newId('hero'),
          src,
          alt: homeDraft.heroImage?.alt ?? '',
        },
      })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Upload failed')
      setStatusKind('error')
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

      <div className="admin-field">
        <span className="label">Hero image</span>
        {homeDraft.heroImage?.src ? (
          <div className="admin-image-card">
            <img
              src={homeDraft.heroImage.src}
              alt={homeDraft.heroImage.alt || 'Hero image'}
            />
            <label>
              Alt text
              <input
                value={homeDraft.heroImage.alt}
                onChange={(e) =>
                  setDraft({
                    ...homeDraft,
                    heroImage: homeDraft.heroImage
                      ? { ...homeDraft.heroImage, alt: e.target.value }
                      : null,
                  })
                }
              />
            </label>
            <fieldset className="admin-choice">
              <legend>Hero placement</legend>
              <label className="admin-choice__option">
                <input
                  type="radio"
                  name="hero-placement"
                  checked={homeDraft.heroPlacement !== 'under'}
                  onChange={() =>
                    setDraft({ ...homeDraft, heroPlacement: 'below' })
                  }
                />
                Below header
              </label>
              <label className="admin-choice__option">
                <input
                  type="radio"
                  name="hero-placement"
                  checked={homeDraft.heroPlacement === 'under'}
                  onChange={() =>
                    setDraft({ ...homeDraft, heroPlacement: 'under' })
                  }
                />
                Layered under header
              </label>
            </fieldset>
            <div className="admin-image-card__actions">
              <button
                type="button"
                onClick={() => setDraft({ ...homeDraft, heroImage: null })}
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            void handleHeroUpload(e.target.files?.[0])
            e.target.value = ''
          }}
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
