import type {
  BlockTheme,
  ButtonItem,
  ContentBlock,
  ImageFit,
  ImageFrame,
  TextAlign,
} from '../content/types'
import MarkdownEditor from './MarkdownEditor'
import { newId } from './newId'

type BlocksEditorProps = {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
  uploadImage: (file: File) => Promise<string>
  onError: (message: string) => void
}

function emptyImage() {
  return { id: newId('img'), src: '', alt: '' }
}

function emptyButton(): ButtonItem {
  return { id: newId('btn'), label: 'Get in touch', href: '/contact' }
}

function createBlock(type: ContentBlock['type']): ContentBlock {
  if (type === 'text') {
    return {
      id: newId('block'),
      type: 'text',
      text: '',
      theme: 'bone',
      textAlign: 'left',
    }
  }
  if (type === 'image') {
    return {
      id: newId('block'),
      type: 'image',
      image: emptyImage(),
      theme: 'bone',
      imageFrame: 'framed',
      imageFit: 'crop',
    }
  }
  if (type === 'buttons') {
    return {
      id: newId('block'),
      type: 'buttons',
      buttons: [emptyButton()],
      theme: 'bone',
    }
  }
  return {
    id: newId('block'),
    type: 'imageText',
    image: emptyImage(),
    text: '',
    imagePosition: 'left',
    theme: 'bone',
    imageFrame: 'framed',
    imageFit: 'crop',
  }
}

function parseTheme(value: string): BlockTheme {
  if (value === 'olive' || value === 'steel' || value === 'slate') return value
  return 'bone'
}

function parseImageFrame(value: string): ImageFrame {
  return value === 'full' ? 'full' : 'framed'
}

function parseImageFit(value: string): ImageFit {
  return value === 'contain' ? 'contain' : 'crop'
}

function parseTextAlign(value: string): TextAlign {
  if (value === 'center' || value === 'right' || value === 'justify') return value
  return 'left'
}

function blockLabel(type: ContentBlock['type']): string {
  if (type === 'image') return 'Image'
  if (type === 'imageText') return 'Image + text'
  if (type === 'buttons') return 'Buttons'
  return 'Text'
}

export default function BlocksEditor({
  blocks,
  onChange,
  uploadImage,
  onError,
}: BlocksEditorProps) {
  function updateBlock(
    blockId: string,
    updater: (block: ContentBlock) => ContentBlock,
  ) {
    onChange(
      blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    )
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= blocks.length) return
    const next = [...blocks]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  function moveButton(
    blockId: string,
    index: number,
    direction: -1 | 1,
  ) {
    updateBlock(blockId, (current) => {
      if (current.type !== 'buttons') return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.buttons.length) return current
      const buttons = [...current.buttons]
      const [item] = buttons.splice(index, 1)
      buttons.splice(nextIndex, 0, item)
      return { ...current, buttons }
    })
  }

  async function handleBlockImageUpload(
    blockId: string,
    file: File | undefined,
  ) {
    if (!file) return
    try {
      const src = await uploadImage(file)
      onChange(
        blocks.map((block) => {
          if (block.id !== blockId) return block
          if (block.type !== 'image' && block.type !== 'imageText') return block
          return { ...block, image: { ...block.image, src } }
        }),
      )
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="admin-field">
      <span className="label">Content blocks</span>
      <div className="admin-block-list">
        {blocks.map((block, index) => (
          <div key={block.id} className="admin-block-card">
            <div className="admin-block-card__header">
              <strong>{blockLabel(block.type)}</strong>
              <div className="admin-block-card__actions">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveBlock(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => moveBlock(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(blocks.filter((entry) => entry.id !== block.id))
                  }
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="admin-field-row">
              <div className="admin-field">
                <label htmlFor={`${block.id}-theme`}>Colour theme</label>
                <select
                  id={`${block.id}-theme`}
                  value={block.theme}
                  onChange={(e) =>
                    updateBlock(block.id, (current) => ({
                      ...current,
                      theme: parseTheme(e.target.value),
                    }))
                  }
                >
                  <option value="bone">Bone</option>
                  <option value="olive">Olive leaf</option>
                  <option value="steel">Cool steel</option>
                  <option value="slate">Blue slate</option>
                </select>
              </div>

              {block.type === 'text' ? (
                <div className="admin-field">
                  <label htmlFor={`${block.id}-align`}>Text alignment</label>
                  <select
                    id={`${block.id}-align`}
                    value={block.textAlign}
                    onChange={(e) =>
                      updateBlock(block.id, (current) =>
                        current.type === 'text'
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

              {block.type === 'image' || block.type === 'imageText' ? (
                <div className="admin-field">
                  <label htmlFor={`${block.id}-frame`}>Image layout</label>
                  <select
                    id={`${block.id}-frame`}
                    value={block.imageFrame}
                    onChange={(e) =>
                      updateBlock(block.id, (current) =>
                        current.type === 'image' || current.type === 'imageText'
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

              {block.type === 'image' || block.type === 'imageText' ? (
                <div className="admin-field">
                  <label htmlFor={`${block.id}-fit`}>Image display</label>
                  <select
                    id={`${block.id}-fit`}
                    value={block.imageFit}
                    onChange={(e) =>
                      updateBlock(block.id, (current) =>
                        current.type === 'image' || current.type === 'imageText'
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

              {block.type === 'imageText' ? (
                <div className="admin-field">
                  <label htmlFor={`${block.id}-position`}>Image position</label>
                  <select
                    id={`${block.id}-position`}
                    value={block.imagePosition}
                    onChange={(e) =>
                      updateBlock(block.id, (current) =>
                        current.type === 'imageText'
                          ? {
                              ...current,
                              imagePosition:
                                e.target.value === 'right' ? 'right' : 'left',
                            }
                          : current,
                      )
                    }
                  >
                    <option value="left">Image left</option>
                    <option value="right">Image right</option>
                  </select>
                </div>
              ) : null}
            </div>

            {block.type === 'text' || block.type === 'imageText' ? (
              <MarkdownEditor
                id={`${block.id}-text`}
                label="Text"
                value={block.text}
                onChange={(text) =>
                  updateBlock(block.id, (current) =>
                    current.type === 'text' || current.type === 'imageText'
                      ? { ...current, text }
                      : current,
                  )
                }
              />
            ) : null}

            {block.type === 'image' || block.type === 'imageText' ? (
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
                          updateBlock(block.id, (current) =>
                            current.type === 'image' ||
                            current.type === 'imageText'
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    void handleBlockImageUpload(block.id, e.target.files?.[0])
                    e.target.value = ''
                  }}
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
                            updateBlock(block.id, (current) => {
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
                            updateBlock(block.id, (current) => {
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
                        onClick={() => moveButton(block.id, buttonIndex, -1)}
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        disabled={buttonIndex === block.buttons.length - 1}
                        onClick={() => moveButton(block.id, buttonIndex, 1)}
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        disabled={block.buttons.length <= 1}
                        onClick={() =>
                          updateBlock(block.id, (current) =>
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
                    updateBlock(block.id, (current) =>
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
          </div>
        ))}
      </div>

      <div className="admin-block-add">
        <button
          type="button"
          onClick={() => onChange([...blocks, createBlock('image')])}
        >
          + Image
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, createBlock('imageText')])}
        >
          + Image + text
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, createBlock('text')])}
        >
          + Text
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, createBlock('buttons')])}
        >
          + Buttons
        </button>
      </div>
    </div>
  )
}
