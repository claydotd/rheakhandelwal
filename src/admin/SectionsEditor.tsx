import {
  equalColumnWidths,
  resizeColumnWidths,
  setColumnWidthPercent,
  widthPresetsForCount,
} from '../content/columnWidths'
import type {
  BlockTheme,
  ButtonItem,
  ColumnCount,
  ContentBlock,
  ContentSection,
  ContentWidth,
  FaqItem,
  ImageAlign,
  ImageFit,
  ImageFrame,
  ImageSize,
  SitePaletteColor,
  TextAlign,
} from '../content/types'
import ImageUploadField from './ImageUploadField'
import MarkdownEditor from './MarkdownEditor'
import { newId } from './newId'

type SectionsEditorProps = {
  sections: ContentSection[]
  onChange: (sections: ContentSection[]) => void
  uploadImage: (file: File) => Promise<string>
  onError: (message: string) => void
}

const COLUMN_OPTIONS: ColumnCount[] = [1, 2, 3, 4]

const TEXT_COLOR_OPTIONS: Array<{ value: SitePaletteColor; label: string }> = [
  { value: 'white', label: 'White' },
  { value: 'pearl', label: 'Pearl' },
  { value: 'warm-cream', label: 'Warm cream' },
  { value: 'pale-honey', label: 'Pale honey' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'golden-honey', label: 'Golden honey' },
  { value: 'walnut', label: 'Walnut' },
  { value: 'lilac', label: 'Lilac' },
  { value: 'stone', label: 'Stone' },
  { value: 'black', label: 'Black' },
]

function emptyImage() {
  return { id: newId('img'), src: '', alt: '' }
}

function emptyButton(): ButtonItem {
  return { id: newId('btn'), label: 'Get in touch', href: '/contact' }
}

function emptyFaqItem(): FaqItem {
  return {
    id: newId('faq'),
    question: 'New question',
    answer: 'New answer',
  }
}

function createBlock(type: ContentBlock['type']): ContentBlock {
  if (type === 'text') {
    return {
      id: newId('block'),
      type: 'text',
      text: '',
      textAlign: 'left',
    }
  }
  if (type === 'image') {
    return {
      id: newId('block'),
      type: 'image',
      image: emptyImage(),
      imageFrame: 'framed',
      imageFit: 'crop',
      imageAlign: 'center',
      imageSize: 'large',
      customHeightPx: 400,
    }
  }
  if (type === 'buttons') {
    return {
      id: newId('block'),
      type: 'buttons',
      buttons: [emptyButton()],
    }
  }
  if (type === 'video') {
    return {
      id: newId('block'),
      type: 'video',
      videoUrl: '',
      title: '',
      imageFrame: 'framed',
    }
  }
  if (type === 'faq') {
    return {
      id: newId('block'),
      type: 'faq',
      heading: 'FAQ',
      subheading: '',
      items: [emptyFaqItem()],
    }
  }
  if (type === 'contactForm') {
    return {
      id: newId('block'),
      type: 'contactForm',
    }
  }
  return {
    id: newId('block'),
    type: 'textOnImage',
    image: emptyImage(),
    text: '',
    textAlign: 'center',
    textColor: 'white',
    imageWidth: 'full',
    textWidth: 'narrow',
    imageFit: 'crop',
  }
}

function createSection(columnCount: ColumnCount): ContentSection {
  return {
    id: newId('section'),
    theme: 'yellow',
    contentWidth: 'content',
    columnCount,
    columnWidths: equalColumnWidths(columnCount),
    columns: Array.from({ length: columnCount }, () => []),
  }
}

function resizeColumns(
  columns: ContentBlock[][],
  columnCount: ColumnCount,
): ContentBlock[][] {
  return Array.from({ length: columnCount }, (_, i) => columns[i] ?? [])
}

function widthOptionLabel(percent: number): string {
  if (percent === 33) return '⅓ (33%)'
  if (percent === 67) return '⅔ (67%)'
  return `${percent}%`
}

function parseTheme(value: string): BlockTheme {
  if (
    value === 'cream' ||
    value === 'pale-honey' ||
    value === 'golden-honey' ||
    value === 'lilac'
  ) {
    return value
  }
  return 'yellow'
}

function parseImageFrame(value: string): ImageFrame {
  return value === 'full' ? 'full' : 'framed'
}

function parseImageFit(value: string): ImageFit {
  return value === 'contain' ? 'contain' : 'crop'
}

function parseImageAlign(value: string): ImageAlign {
  if (value === 'left' || value === 'right') return value
  return 'center'
}

function parseImageSize(value: string): ImageSize {
  if (value === 'small' || value === 'medium' || value === 'custom') return value
  return 'large'
}

function parseTextAlign(value: string): TextAlign {
  if (value === 'center' || value === 'right' || value === 'justify') return value
  return 'left'
}

function parseContentWidth(value: string): ContentWidth {
  if (
    value === 'narrow' ||
    value === 'medium' ||
    value === 'wide' ||
    value === 'full'
  ) {
    return value
  }
  return 'content'
}

function parseTextColor(value: string): SitePaletteColor {
  return (
    TEXT_COLOR_OPTIONS.find((option) => option.value === value)?.value ??
    'white'
  )
}

function withBlockTheme(
  block: ContentBlock,
  theme: BlockTheme,
  sectionTheme: BlockTheme,
): ContentBlock {
  const next = { ...block }
  if (theme === sectionTheme) delete next.theme
  else next.theme = theme
  return next
}

function withBlockContentWidth(
  block: ContentBlock,
  contentWidth: ContentWidth,
  sectionWidth: ContentWidth,
): ContentBlock {
  if (block.type === 'textOnImage') return block
  const next = { ...block }
  if (contentWidth === sectionWidth) delete next.contentWidth
  else next.contentWidth = contentWidth
  return next
}

function clearColumnThemes(columns: ContentBlock[][]): ContentBlock[][] {
  return columns.map((column) =>
    column.map((block) => {
      const next = { ...block }
      delete next.theme
      return next
    }),
  )
}

function parseColumnCount(value: string): ColumnCount {
  const n = Number.parseInt(value, 10)
  if (n === 2 || n === 3 || n === 4) return n
  return 1
}

function blockLabel(type: ContentBlock['type']): string {
  if (type === 'image') return 'Image'
  if (type === 'textOnImage') return 'Text on image'
  if (type === 'video') return 'Video embed'
  if (type === 'buttons') return 'Buttons'
  if (type === 'faq') return 'FAQ'
  if (type === 'contactForm') return 'Contact form'
  return 'Text'
}

function ContentWidthSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: ContentWidth
  onChange: (value: ContentWidth) => void
}) {
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parseContentWidth(e.target.value))}
      >
        <option value="narrow">Narrow</option>
        <option value="medium">Medium</option>
        <option value="content">Match site content</option>
        <option value="wide">Wide</option>
        <option value="full">Full-width</option>
      </select>
    </div>
  )
}

function ThemeSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: BlockTheme
  onChange: (value: BlockTheme) => void
}) {
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parseTheme(e.target.value))}
      >
        <option value="yellow">Yellow (default)</option>
        <option value="cream">Cream</option>
        <option value="pale-honey">Pale honey</option>
        <option value="golden-honey">Golden honey</option>
        <option value="lilac">Lilac</option>
      </select>
    </div>
  )
}

type BlockEditorProps = {
  block: ContentBlock
  sectionTheme: BlockTheme
  sectionWidth: ContentWidth
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (block: ContentBlock) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  uploadImage: (file: File) => Promise<string>
  onError: (message: string) => void
}

function BlockEditor({
  block,
  sectionTheme,
  sectionWidth,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  uploadImage,
  onError,
}: BlockEditorProps) {
  function update(updater: (current: ContentBlock) => ContentBlock) {
    onChange(updater(block))
  }

  function moveButton(index: number, direction: -1 | 1) {
    update((current) => {
      if (current.type !== 'buttons') return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.buttons.length) return current
      const buttons = [...current.buttons]
      const [item] = buttons.splice(index, 1)
      buttons.splice(nextIndex, 0, item)
      return { ...current, buttons }
    })
  }

  function moveFaqItem(index: number, direction: -1 | 1) {
    update((current) => {
      if (current.type !== 'faq') return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.items.length) return current
      const items = [...current.items]
      const [item] = items.splice(index, 1)
      items.splice(nextIndex, 0, item)
      return { ...current, items }
    })
  }

  return (
    <div className="admin-column-block">
      <div className="admin-column-block__header">
        <strong>{blockLabel(block.type)}</strong>
        <div className="admin-column-block__actions">
          <button type="button" disabled={!canMoveUp} onClick={onMoveUp}>
            Move up
          </button>
          <button type="button" disabled={!canMoveDown} onClick={onMoveDown}>
            Move down
          </button>
          <button
            type="button"
            className="admin-column-block__clear"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="admin-field-row admin-block-settings">
        <ThemeSelect
          id={`${block.id}-theme`}
          label="Colour theme"
          value={block.theme ?? sectionTheme}
          onChange={(theme) =>
            update((current) => withBlockTheme(current, theme, sectionTheme))
          }
        />

        {block.type !== 'textOnImage' ? (
          <ContentWidthSelect
            id={`${block.id}-width`}
            label="Content width"
            value={block.contentWidth ?? sectionWidth}
            onChange={(contentWidth) =>
              update((current) =>
                withBlockContentWidth(current, contentWidth, sectionWidth),
              )
            }
          />
        ) : null}

        {block.type === 'textOnImage' ? (
          <>
            <ContentWidthSelect
              id={`${block.id}-image-width`}
              label="Image width"
              value={block.imageWidth}
              onChange={(imageWidth) =>
                update((current) =>
                  current.type === 'textOnImage'
                    ? { ...current, imageWidth }
                    : current,
                )
              }
            />
            <ContentWidthSelect
              id={`${block.id}-text-width`}
              label="Text width"
              value={block.textWidth}
              onChange={(textWidth) =>
                update((current) =>
                  current.type === 'textOnImage'
                    ? { ...current, textWidth }
                    : current,
                )
              }
            />
            <div className="admin-field">
              <label htmlFor={`${block.id}-text-color`}>Text colour</label>
              <select
                id={`${block.id}-text-color`}
                value={block.textColor}
                onChange={(e) =>
                  update((current) =>
                    current.type === 'textOnImage'
                      ? {
                          ...current,
                          textColor: parseTextColor(e.target.value),
                        }
                      : current,
                  )
                }
              >
                {TEXT_COLOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        {block.type === 'text' || block.type === 'textOnImage' ? (
          <div className="admin-field">
            <label htmlFor={`${block.id}-align`}>Text alignment</label>
            <select
              id={`${block.id}-align`}
              value={block.textAlign}
              onChange={(e) =>
                update((current) =>
                  current.type === 'text' || current.type === 'textOnImage'
                    ? {
                        ...current,
                        textAlign: parseTextAlign(e.target.value),
                      }
                    : current,
                )
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        ) : null}

        {block.type === 'image' || block.type === 'video' ? (
          <div className="admin-field">
            <label htmlFor={`${block.id}-frame`}>
              {block.type === 'video' ? 'Video layout' : 'Image layout'}
            </label>
            <select
              id={`${block.id}-frame`}
              value={block.imageFrame}
              onChange={(e) =>
                update((current) =>
                  current.type === 'image' || current.type === 'video'
                    ? {
                        ...current,
                        imageFrame: parseImageFrame(e.target.value),
                      }
                    : current,
                )
              }
            >
              <option value="framed">Framed (padded)</option>
              <option value="full">Full (edge to edge)</option>
            </select>
          </div>
        ) : null}

        {block.type === 'image' || block.type === 'textOnImage' ? (
          <div className="admin-field">
            <label htmlFor={`${block.id}-fit`}>Image display</label>
            <select
              id={`${block.id}-fit`}
              value={block.imageFit}
              onChange={(e) =>
                update((current) =>
                  current.type === 'image' || current.type === 'textOnImage'
                    ? {
                        ...current,
                        imageFit: parseImageFit(e.target.value),
                      }
                    : current,
                )
              }
            >
              <option value="crop">Crop to fill</option>
              <option value="contain">Show full image</option>
            </select>
          </div>
        ) : null}

        {block.type === 'image' ? (
          <>
            <div className="admin-field">
              <label htmlFor={`${block.id}-image-align`}>Image alignment</label>
              <select
                id={`${block.id}-image-align`}
                value={block.imageAlign}
                onChange={(e) =>
                  update((current) =>
                    current.type === 'image'
                      ? {
                          ...current,
                          imageAlign: parseImageAlign(e.target.value),
                        }
                      : current,
                  )
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor={`${block.id}-image-size`}>Image size</label>
              <select
                id={`${block.id}-image-size`}
                value={block.imageSize}
                onChange={(e) =>
                  update((current) =>
                    current.type === 'image'
                      ? {
                          ...current,
                          imageSize: parseImageSize(e.target.value),
                        }
                      : current,
                  )
                }
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {block.imageSize === 'custom' ? (
              <div className="admin-field">
                <label htmlFor={`${block.id}-image-height`}>Height (px)</label>
                <input
                  id={`${block.id}-image-height`}
                  type="number"
                  min={80}
                  max={1200}
                  step={10}
                  value={block.customHeightPx}
                  onChange={(e) =>
                    update((current) =>
                      current.type === 'image'
                        ? {
                            ...current,
                            customHeightPx: Math.max(
                              0,
                              Number.parseFloat(e.target.value) || 0,
                            ),
                          }
                        : current,
                    )
                  }
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {block.type === 'text' ||
      block.type === 'textOnImage' ? (
        <MarkdownEditor
          id={`${block.id}-text`}
          label="Text"
          value={block.text}
          onChange={(text) =>
            update((current) =>
              current.type === 'text' || current.type === 'textOnImage'
                ? { ...current, text }
                : current,
            )
          }
        />
      ) : null}

      {block.type === 'video' ? (
        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor={`${block.id}-video`}>YouTube URL</label>
            <input
              id={`${block.id}-video`}
              value={block.videoUrl}
              placeholder="https://www.youtube.com/watch?v=…"
              onChange={(e) =>
                update((current) =>
                  current.type === 'video'
                    ? { ...current, videoUrl: e.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="admin-field">
            <label htmlFor={`${block.id}-video-title`}>
              Video title (optional)
            </label>
            <input
              id={`${block.id}-video-title`}
              value={block.title}
              placeholder="Accessible iframe title"
              onChange={(e) =>
                update((current) =>
                  current.type === 'video'
                    ? { ...current, title: e.target.value }
                    : current,
                )
              }
            />
          </div>
        </div>
      ) : null}

      {block.type === 'image' || block.type === 'textOnImage' ? (
        <>
          {block.image.src ? (
            <div className="admin-image-card">
              <img
                src={block.image.src}
                alt={block.image.alt || 'Block image'}
              />
              <label>
                Alt text
                <input
                  value={block.image.alt}
                  onChange={(e) =>
                    update((current) =>
                      current.type === 'image' ||
                      current.type === 'textOnImage'
                        ? {
                            ...current,
                            image: {
                              ...current.image,
                              alt: e.target.value,
                            },
                          }
                        : current,
                    )
                  }
                />
              </label>
            </div>
          ) : (
            <p className="admin-hint">No image uploaded yet.</p>
          )}
          <ImageUploadField
            uploadImage={uploadImage}
            onUploaded={(src) =>
              update((current) =>
                current.type === 'image' || current.type === 'textOnImage'
                  ? { ...current, image: { ...current.image, src } }
                  : current,
              )
            }
            onError={onError}
          />
        </>
      ) : null}

      {block.type === 'buttons' ? (
        <div className="admin-button-list">
          {block.buttons.map((button, buttonIndex) => (
            <div key={button.id} className="admin-button-card">
              <div className="admin-field-row">
                <div className="admin-field">
                  <label htmlFor={`${button.id}-label`}>Label</label>
                  <input
                    id={`${button.id}-label`}
                    value={button.label}
                    onChange={(e) =>
                      update((current) => {
                        if (current.type !== 'buttons') return current
                        const buttons = [...current.buttons]
                        buttons[buttonIndex] = {
                          ...button,
                          label: e.target.value,
                        }
                        return { ...current, buttons }
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`${button.id}-href`}>Link</label>
                  <input
                    id={`${button.id}-href`}
                    value={button.href}
                    placeholder="/contact"
                    onChange={(e) =>
                      update((current) => {
                        if (current.type !== 'buttons') return current
                        const buttons = [...current.buttons]
                        buttons[buttonIndex] = {
                          ...button,
                          href: e.target.value,
                        }
                        return { ...current, buttons }
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-button-card__actions">
                <button
                  type="button"
                  disabled={buttonIndex === 0}
                  onClick={() => moveButton(buttonIndex, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={buttonIndex === block.buttons.length - 1}
                  onClick={() => moveButton(buttonIndex, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  disabled={block.buttons.length <= 1}
                  onClick={() =>
                    update((current) =>
                      current.type === 'buttons'
                        ? {
                            ...current,
                            buttons: current.buttons.filter(
                              (entry) => entry.id !== button.id,
                            ),
                          }
                        : current,
                    )
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
              update((current) =>
                current.type === 'buttons'
                  ? {
                      ...current,
                      buttons: [...current.buttons, emptyButton()],
                    }
                  : current,
              )
            }
          >
            + Add button
          </button>
        </div>
      ) : null}

      {block.type === 'faq' ? (
        <div className="admin-faq-list">
          <div className="admin-field">
            <label htmlFor={`${block.id}-heading`}>Heading</label>
            <input
              id={`${block.id}-heading`}
              value={block.heading}
              onChange={(e) =>
                update((current) =>
                  current.type === 'faq'
                    ? { ...current, heading: e.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="admin-field">
            <label htmlFor={`${block.id}-subheading`}>Subheading</label>
            <input
              id={`${block.id}-subheading`}
              value={block.subheading}
              onChange={(e) =>
                update((current) =>
                  current.type === 'faq'
                    ? { ...current, subheading: e.target.value }
                    : current,
                )
              }
            />
          </div>
          {block.items.map((item, itemIndex) => (
            <div key={item.id} className="admin-faq-card">
              <div className="admin-field">
                <label htmlFor={`${item.id}-q`}>Question</label>
                <input
                  id={`${item.id}-q`}
                  value={item.question}
                  onChange={(e) =>
                    update((current) => {
                      if (current.type !== 'faq') return current
                      const items = [...current.items]
                      items[itemIndex] = {
                        ...item,
                        question: e.target.value,
                      }
                      return { ...current, items }
                    })
                  }
                />
              </div>
              <MarkdownEditor
                id={`${item.id}-a`}
                label="Answer"
                value={item.answer}
                onChange={(answer) =>
                  update((current) => {
                    if (current.type !== 'faq') return current
                    const items = [...current.items]
                    items[itemIndex] = { ...item, answer }
                    return { ...current, items }
                  })
                }
              />
              <div className="admin-faq-card__actions">
                <button
                  type="button"
                  disabled={itemIndex === 0}
                  onClick={() => moveFaqItem(itemIndex, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={itemIndex === block.items.length - 1}
                  onClick={() => moveFaqItem(itemIndex, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update((current) =>
                      current.type === 'faq'
                        ? {
                            ...current,
                            items: current.items.filter(
                              (entry) => entry.id !== item.id,
                            ),
                          }
                        : current,
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update((current) =>
                current.type === 'faq'
                  ? {
                      ...current,
                      items: [...current.items, emptyFaqItem()],
                    }
                  : current,
              )
            }
          >
            + Add question
          </button>
        </div>
      ) : null}

      {block.type === 'contactForm' ? (
        <p className="admin-hint">
          Renders the site contact form. Field labels are fixed in the form
          component.
        </p>
      ) : null}
    </div>
  )
}

function ColumnSlot({
  sectionId,
  columnIndex,
  blocks,
  columnCount,
  columnWidth,
  sectionTheme,
  sectionWidth,
  onChange,
  onWidthChange,
  uploadImage,
  onError,
}: {
  sectionId: string
  columnIndex: number
  blocks: ContentBlock[]
  columnCount: ColumnCount
  columnWidth: number
  sectionTheme: BlockTheme
  sectionWidth: ContentWidth
  onChange: (blocks: ContentBlock[]) => void
  onWidthChange: (percent: number) => void
  uploadImage: (file: File) => Promise<string>
  onError: (message: string) => void
}) {
  const presets = widthPresetsForCount(columnCount)
  const widthOptions =
    presets.includes(columnWidth) || columnCount === 1
      ? presets
      : [...presets, columnWidth].sort((a, b) => a - b)
  const widthFieldId = `${sectionId}-col-${columnIndex}-width`

  function addBlock(type: ContentBlock['type']) {
    onChange([...blocks, createBlock(type)])
  }

  function updateBlock(blockIndex: number, block: ContentBlock) {
    const next = [...blocks]
    next[blockIndex] = block
    onChange(next)
  }

  function removeBlock(blockIndex: number) {
    onChange(blocks.filter((_, index) => index !== blockIndex))
  }

  function moveBlock(blockIndex: number, direction: -1 | 1) {
    const nextIndex = blockIndex + direction
    if (nextIndex < 0 || nextIndex >= blocks.length) return
    const next = [...blocks]
    const [item] = next.splice(blockIndex, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  return (
    <div className="admin-column-slot">
      <div className="admin-column-slot__header">
        <div className="admin-column-slot__label">Column {columnIndex + 1}</div>
        {columnCount === 2 ? (
          <div className="admin-field admin-column-slot__width">
            <label htmlFor={widthFieldId}>Width</label>
            <select
              id={widthFieldId}
              value={columnWidth}
              onChange={(e) =>
                onWidthChange(Number.parseInt(e.target.value, 10))
              }
            >
              {widthOptions.map((percent) => (
                <option key={percent} value={percent}>
                  {widthOptionLabel(percent)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {blocks.map((block, blockIndex) => (
        <BlockEditor
          key={block.id}
          block={block}
          sectionTheme={sectionTheme}
          sectionWidth={sectionWidth}
          canMoveUp={blockIndex > 0}
          canMoveDown={blockIndex < blocks.length - 1}
          onChange={(next) => updateBlock(blockIndex, next)}
          onRemove={() => removeBlock(blockIndex)}
          onMoveUp={() => moveBlock(blockIndex, -1)}
          onMoveDown={() => moveBlock(blockIndex, 1)}
          uploadImage={uploadImage}
          onError={onError}
        />
      ))}

      <div className="admin-block-add admin-block-add--column">
        <button type="button" onClick={() => addBlock('image')}>
          + Image
        </button>
        <button type="button" onClick={() => addBlock('textOnImage')}>
          + Text on image
        </button>
        <button type="button" onClick={() => addBlock('video')}>
          + Video embed
        </button>
        <button type="button" onClick={() => addBlock('text')}>
          + Text
        </button>
        <button type="button" onClick={() => addBlock('buttons')}>
          + Buttons
        </button>
        <button type="button" onClick={() => addBlock('faq')}>
          + FAQ
        </button>
        <button type="button" onClick={() => addBlock('contactForm')}>
          + Contact form
        </button>
      </div>
    </div>
  )
}

export default function SectionsEditor({
  sections,
  onChange,
  uploadImage,
  onError,
}: SectionsEditorProps) {
  function updateSection(
    sectionId: string,
    updater: (section: ContentSection) => ContentSection,
  ) {
    onChange(
      sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    )
  }

  function moveSection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= sections.length) return
    const next = [...sections]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  return (
    <div className="admin-field">
      <span className="label">Content sections</span>
      <div className="admin-block-list">
        {sections.map((section, index) => (
          <div key={section.id} className="admin-block-card admin-section-card">
            <div className="admin-block-card__header">
              <strong>
                Section · {section.columnCount}{' '}
                {section.columnCount === 1 ? 'column' : 'columns'}
              </strong>
              <div className="admin-block-card__actions">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      sections.filter((entry) => entry.id !== section.id),
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="admin-field-row admin-block-settings">
              <ThemeSelect
                id={`${section.id}-theme`}
                label="Colour theme"
                value={section.theme}
                onChange={(theme) =>
                  updateSection(section.id, (current) => ({
                    ...current,
                    theme,
                    columns: clearColumnThemes(current.columns),
                  }))
                }
              />
              <ContentWidthSelect
                id={`${section.id}-width`}
                label="Content width"
                value={section.contentWidth}
                onChange={(contentWidth) =>
                  updateSection(section.id, (current) => ({
                    ...current,
                    contentWidth,
                  }))
                }
              />
              <div className="admin-field">
                <label htmlFor={`${section.id}-columns`}>Columns</label>
                <select
                  id={`${section.id}-columns`}
                  value={section.columnCount}
                  onChange={(e) => {
                    const columnCount = parseColumnCount(e.target.value)
                    updateSection(section.id, (current) => ({
                      ...current,
                      columnCount,
                      columnWidths: resizeColumnWidths(columnCount),
                      columns: resizeColumns(current.columns, columnCount),
                    }))
                  }}
                >
                  {COLUMN_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
              {section.columnCount === 2 ? (
                <div className="admin-field">
                  <label htmlFor={`${section.id}-equal-widths`}>Widths</label>
                  <button
                    id={`${section.id}-equal-widths`}
                    type="button"
                    onClick={() =>
                      updateSection(section.id, (current) => ({
                        ...current,
                        columnWidths: equalColumnWidths(current.columnCount),
                      }))
                    }
                  >
                    Reset equal
                  </button>
                </div>
              ) : null}
            </div>

            <div
              className="admin-section-columns"
              data-columns={section.columnCount}
            >
              {section.columns.map((column, columnIndex) => (
                <ColumnSlot
                  key={`${section.id}-col-${columnIndex}`}
                  sectionId={section.id}
                  columnIndex={columnIndex}
                  blocks={column}
                  columnCount={section.columnCount}
                  columnWidth={
                    section.columnWidths[columnIndex] ??
                    Math.round(100 / section.columnCount)
                  }
                  sectionTheme={section.theme}
                  sectionWidth={section.contentWidth}
                  onChange={(blocks) =>
                    updateSection(section.id, (current) => {
                      const columns = [...current.columns]
                      columns[columnIndex] = blocks
                      return { ...current, columns }
                    })
                  }
                  onWidthChange={(percent) =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      columnWidths: setColumnWidthPercent(
                        current.columnWidths,
                        columnIndex,
                        percent,
                      ),
                    }))
                  }
                  uploadImage={uploadImage}
                  onError={onError}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-block-add admin-section-add">
        <span className="admin-section-add__label">+ Add section</span>
        {COLUMN_OPTIONS.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange([...sections, createSection(count)])}
          >
            {count} {count === 1 ? 'column' : 'columns'}
          </button>
        ))}
      </div>
    </div>
  )
}
