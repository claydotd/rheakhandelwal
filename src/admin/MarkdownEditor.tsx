import { useEffect, useId, useRef, useState } from 'react'
import { htmlToMarkdown, markdownToHtml } from './markdownConvert'

type EditorTab = 'preview' | 'code'

type MarkdownEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
}

function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder = 'text',
): { next: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(start, end)
  const inner = selected || placeholder
  const next = value.slice(0, start) + before + inner + after + value.slice(end)
  if (selected) {
    return {
      next,
      selectionStart: start,
      selectionEnd: start + before.length + inner.length + after.length,
    }
  }
  return {
    next,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + inner.length,
  }
}

function toggleLineHeading(
  value: string,
  start: number,
  end: number,
  level: 1 | 2 | 3,
): { next: string; selectionStart: number; selectionEnd: number } {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEndIndex = value.indexOf('\n', end)
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
  const line = value.slice(lineStart, lineEnd)
  const stripped = line.replace(/^#{1,6}\s+/, '')
  const prefix = `${'#'.repeat(level)} `
  const already = line.startsWith(prefix)
  const nextLine = already ? stripped : prefix + stripped
  const next = value.slice(0, lineStart) + nextLine + value.slice(lineEnd)
  const delta = nextLine.length - line.length
  return {
    next,
    selectionStart: Math.max(lineStart, start + delta),
    selectionEnd: Math.max(lineStart, end + delta),
  }
}

export default function MarkdownEditor({
  label,
  value,
  onChange,
  id,
}: MarkdownEditorProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const labelId = `${fieldId}-label`
  const [tab, setTab] = useState<EditorTab>('preview')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewFocusedRef = useRef(false)
  const lastSyncedMarkdownRef = useRef(value)

  useEffect(() => {
    if (tab !== 'preview' || !previewRef.current) return
    if (previewFocusedRef.current) return
    previewRef.current.innerHTML = markdownToHtml(value) || ''
    lastSyncedMarkdownRef.current = value
  }, [tab, value])

  function syncPreviewToMarkdown() {
    if (!previewRef.current) return
    const next = htmlToMarkdown(previewRef.current.innerHTML)
    lastSyncedMarkdownRef.current = next
    if (next !== value) onChange(next)
  }

  function applyInCode(
    transform: (
      current: string,
      start: number,
      end: number,
    ) => { next: string; selectionStart: number; selectionEnd: number },
  ) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const result = transform(value, start, end)
    onChange(result.next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  function applyInPreview(command: string, commandValue?: string) {
    previewRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncPreviewToMarkdown()
  }

  function handleHeading(level: 1 | 2 | 3) {
    if (tab === 'code') {
      applyInCode((current, start, end) =>
        toggleLineHeading(current, start, end, level),
      )
      return
    }
    applyInPreview('formatBlock', `h${level}`)
  }

  function handleBold() {
    if (tab === 'code') {
      applyInCode((current, start, end) =>
        wrapSelection(current, start, end, '**', '**'),
      )
      return
    }
    applyInPreview('bold')
  }

  function handleItalic() {
    if (tab === 'code') {
      applyInCode((current, start, end) =>
        wrapSelection(current, start, end, '*', '*'),
      )
      return
    }
    applyInPreview('italic')
  }

  function handleUnderline() {
    if (tab === 'code') {
      applyInCode((current, start, end) =>
        wrapSelection(current, start, end, '<u>', '</u>'),
      )
      return
    }
    applyInPreview('underline')
  }

  function handleLink() {
    const url = window.prompt('Link URL', 'https://')
    if (!url) return

    if (tab === 'code') {
      applyInCode((current, start, end) => {
        const selected = current.slice(start, end) || 'link text'
        const insertion = `[${selected}](${url})`
        return {
          next: current.slice(0, start) + insertion + current.slice(end),
          selectionStart: start,
          selectionEnd: start + insertion.length,
        }
      })
      return
    }

    applyInPreview('createLink', url)
  }

  function switchTab(nextTab: EditorTab) {
    if (nextTab === tab) return
    if (tab === 'preview') syncPreviewToMarkdown()
    setTab(nextTab)
  }

  return (
    <div className="admin-field md-editor">
      <div className="md-editor__top">
        <span className="label" id={labelId}>
          {label}
        </span>
        <div className="md-editor__tabs" role="tablist" aria-label="Editor mode">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            className={tab === 'preview' ? 'is-active' : undefined}
            onClick={() => switchTab('preview')}
          >
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            className={tab === 'code' ? 'is-active' : undefined}
            onClick={() => switchTab('code')}
          >
            Code
          </button>
        </div>
      </div>

      <div className="md-editor__toolbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading(1)}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading(2)}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading(3)}
          title="Heading 3"
        >
          H3
        </button>
        <span className="md-editor__toolbar-sep" aria-hidden="true" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleBold}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleItalic}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleUnderline}
          title="Underline"
        >
          <span className="md-editor__underline-mark">U</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          title="Link"
        >
          Link
        </button>
      </div>

      {tab === 'code' ? (
        <textarea
          id={fieldId}
          ref={textareaRef}
          className="md-editor__code"
          value={value}
          aria-labelledby={labelId}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
        />
      ) : (
        <div
          ref={previewRef}
          className="md-editor__preview markdown"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-labelledby={labelId}
          suppressContentEditableWarning
          onFocus={() => {
            previewFocusedRef.current = true
          }}
          onBlur={() => {
            previewFocusedRef.current = false
            syncPreviewToMarkdown()
          }}
          onInput={() => {
            syncPreviewToMarkdown()
          }}
        />
      )}
    </div>
  )
}
