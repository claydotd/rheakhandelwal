import { useState } from 'react'
import { DEFAULT_FOOTER } from '../content/normalize'
import type {
  FooterContent,
  FooterWidthMode,
  SiteContent,
  SitePaletteColor,
} from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import { newId } from './newId'
import './admin.css'

const PALETTE_OPTIONS: Array<{ value: SitePaletteColor; label: string }> = [
  { value: 'walnut', label: 'Walnut' },
  { value: 'stone', label: 'Stone' },
  { value: 'black', label: 'Black' },
  { value: 'lilac', label: 'Lilac' },
  { value: 'warm-cream', label: 'Warm cream' },
  { value: 'pearl', label: 'Pearl' },
  { value: 'white', label: 'White' },
  { value: 'pale-honey', label: 'Pale honey' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'golden-honey', label: 'Golden honey' },
]

function parsePaletteColor(value: string): SitePaletteColor {
  return (
    PALETTE_OPTIONS.find((option) => option.value === value)?.value ??
    DEFAULT_FOOTER.backgroundColor
  )
}

function parseWidthMode(value: string): FooterWidthMode {
  if (
    value === 'narrow' ||
    value === 'medium' ||
    value === 'wide' ||
    value === 'full' ||
    value === 'content' ||
    value === 'custom'
  ) {
    return value
  }
  return 'full'
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: SitePaletteColor
  onChange: (value: SitePaletteColor) => void
}) {
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parsePaletteColor(e.target.value))}
      >
        {PALETTE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FooterEditor() {
  const { content, loading, error, save } = useSiteContent()
  const [draft, setDraft] = useState<FooterContent | null>(null)
  const [sourceContent, setSourceContent] = useState<SiteContent | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'ok' | 'error' | null>(null)
  const [saving, setSaving] = useState(false)

  if (content && sourceContent !== content) {
    setSourceContent(content)
    setDraft(structuredClone(content.footer ?? DEFAULT_FOOTER))
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>
  if (!content || !draft) return null

  const footerDraft = draft
  const siteContent = content

  function update(patch: Partial<FooterContent>) {
    setDraft({ ...footerDraft, ...patch })
  }

  function moveLink(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= footerDraft.links.length) return
    const links = [...footerDraft.links]
    const [item] = links.splice(index, 1)
    links.splice(nextIndex, 0, item)
    update({ links })
  }

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    setStatusKind(null)
    try {
      await save({ ...siteContent, footer: footerDraft })
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
      <section className="admin-section">
        <h2>Colours</h2>
        <div className="admin-field-row">
          <ColorField
            id="footer-bg"
            label="Background"
            value={footerDraft.backgroundColor}
            onChange={(backgroundColor) => update({ backgroundColor })}
          />
          <ColorField
            id="footer-text"
            label="Text"
            value={footerDraft.textColor}
            onChange={(textColor) => update({ textColor })}
          />
          <ColorField
            id="footer-link"
            label="Links"
            value={footerDraft.linkColor}
            onChange={(linkColor) => update({ linkColor })}
          />
          <ColorField
            id="footer-link-hover"
            label="Link hover"
            value={footerDraft.linkHoverColor}
            onChange={(linkHoverColor) => update({ linkHoverColor })}
          />
        </div>
      </section>

      <section className="admin-section">
        <h2>Size</h2>
        <div className="admin-field-row admin-field-row--pair">
          <div className="admin-field">
            <label htmlFor="footer-width-mode">Content width</label>
            <select
              id="footer-width-mode"
              value={footerDraft.widthMode}
              onChange={(e) =>
                update({ widthMode: parseWidthMode(e.target.value) })
              }
            >
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
              <option value="full">Full-width</option>
              <option value="content">Match Site Content</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="footer-padding-y">Height / padding (rem)</label>
            <input
              id="footer-padding-y"
              type="number"
              min={0.5}
              max={8}
              step={0.25}
              value={footerDraft.paddingYRem}
              onChange={(e) =>
                update({
                  paddingYRem: Math.max(
                    0,
                    Number.parseFloat(e.target.value) || 0,
                  ),
                })
              }
            />
          </div>
        </div>
        {footerDraft.widthMode === 'custom' ? (
          <div className="admin-field">
            <label htmlFor="footer-custom-width">Custom width (rem)</label>
            <input
              id="footer-custom-width"
              type="number"
              min={20}
              max={120}
              step={1}
              value={footerDraft.customWidthRem}
              onChange={(e) =>
                update({
                  customWidthRem: Math.max(
                    0,
                    Number.parseFloat(e.target.value) || 0,
                  ),
                })
              }
            />
          </div>
        ) : null}
        <p className="admin-hint">
          Height / padding sets the vertical padding around the footer content.
        </p>
      </section>

      <section className="admin-section">
        <h2>Details</h2>
        <div className="admin-field">
          <label htmlFor="footer-copyright">Copyright name</label>
          <input
            id="footer-copyright"
            value={footerDraft.copyrightName}
            onChange={(e) => update({ copyrightName: e.target.value })}
          />
        </div>
        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor="footer-email">Email</label>
            <input
              id="footer-email"
              type="email"
              value={footerDraft.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="footer-bacp">BACP registration</label>
            <input
              id="footer-bacp"
              value={footerDraft.bacpRegistration}
              onChange={(e) => update({ bacpRegistration: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2>Links</h2>
        <p className="admin-hint">
          Use a site path like <code>/privacy</code> for internal pages, or a
          full URL for external links.
        </p>
        <div className="admin-button-list">
          {footerDraft.links.map((link, index) => (
            <div key={link.id} className="admin-button-card">
              <div className="admin-field-row">
                <div className="admin-field">
                  <label htmlFor={`${link.id}-label`}>Label</label>
                  <input
                    id={`${link.id}-label`}
                    value={link.label}
                    onChange={(e) => {
                      const links = [...footerDraft.links]
                      links[index] = { ...link, label: e.target.value }
                      update({ links })
                    }}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`${link.id}-href`}>Link</label>
                  <input
                    id={`${link.id}-href`}
                    value={link.href}
                    placeholder="/privacy"
                    onChange={(e) => {
                      const links = [...footerDraft.links]
                      links[index] = { ...link, href: e.target.value }
                      update({ links })
                    }}
                  />
                </div>
              </div>
              <div className="admin-button-card__actions">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveLink(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === footerDraft.links.length - 1}
                  onClick={() => moveLink(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update({
                      links: footerDraft.links.filter(
                        (entry) => entry.id !== link.id,
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update({
                links: [
                  ...footerDraft.links,
                  {
                    id: newId('footer-link'),
                    label: 'New link',
                    href: '/',
                  },
                ],
              })
            }
          >
            + Add link
          </button>
        </div>
      </section>

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
