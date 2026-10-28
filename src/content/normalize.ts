import type {
  BlockTheme,
  ButtonItem,
  ContentBlock,
  HomePageContent,
  ImageFit,
  ImageFrame,
  ImageRef,
  PageContent,
  SiteContent,
  TextAlign,
} from './types'

const BLOCK_THEMES: BlockTheme[] = ['bone', 'olive', 'steel', 'slate']
const TEXT_ALIGNS: TextAlign[] = ['left', 'center', 'right', 'justify']

function normalizeTheme(value: unknown): BlockTheme {
  // Migrate retired theme keys
  if (value === 'sage' || value === 'fawn') return 'bone'
  return BLOCK_THEMES.includes(value as BlockTheme)
    ? (value as BlockTheme)
    : 'bone'
}

function normalizeImageFrame(value: unknown): ImageFrame {
  return value === 'full' ? 'full' : 'framed'
}

function normalizeImageFit(value: unknown): ImageFit {
  return value === 'contain' ? 'contain' : 'crop'
}

function normalizeTextAlign(value: unknown): TextAlign {
  return TEXT_ALIGNS.includes(value as TextAlign)
    ? (value as TextAlign)
    : 'left'
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function normalizeImageRef(value: unknown, fallbackId: string): ImageRef | null {
  const record = asRecord(value)
  if (!record || typeof record.src !== 'string' || !record.src) return null
  return {
    id: typeof record.id === 'string' ? record.id : fallbackId,
    src: record.src,
    alt: typeof record.alt === 'string' ? record.alt : '',
  }
}

function normalizeButton(value: unknown, index: number): ButtonItem | null {
  const record = asRecord(value)
  if (!record) return null
  const label = typeof record.label === 'string' ? record.label.trim() : ''
  const href = typeof record.href === 'string' ? record.href.trim() : ''
  if (!label && !href) return null
  return {
    id: typeof record.id === 'string' ? record.id : `btn-${index}`,
    label,
    href,
  }
}

function normalizeBlock(value: unknown, index: number): ContentBlock | null {
  const record = asRecord(value)
  if (!record || typeof record.type !== 'string') return null

  const id = typeof record.id === 'string' ? record.id : `block-${index}`

  const theme = normalizeTheme(record.theme)

  if (record.type === 'text') {
    return {
      id,
      type: 'text',
      text: typeof record.text === 'string' ? record.text : '',
      theme,
      textAlign: normalizeTextAlign(record.textAlign),
    }
  }

  if (record.type === 'image') {
    const image = normalizeImageRef(record.image, `${id}-img`)
    if (!image) return null
    return {
      id,
      type: 'image',
      image,
      theme,
      imageFrame: normalizeImageFrame(record.imageFrame),
      imageFit: normalizeImageFit(record.imageFit),
    }
  }

  if (record.type === 'imageText') {
    const image = normalizeImageRef(record.image, `${id}-img`)
    if (!image) return null
    return {
      id,
      type: 'imageText',
      image,
      text: typeof record.text === 'string' ? record.text : '',
      imagePosition: record.imagePosition === 'right' ? 'right' : 'left',
      theme,
      imageFrame: normalizeImageFrame(record.imageFrame),
      imageFit: normalizeImageFit(record.imageFit),
    }
  }

  if (record.type === 'buttons') {
    const buttons = Array.isArray(record.buttons)
      ? record.buttons
          .map((button, buttonIndex) => normalizeButton(button, buttonIndex))
          .filter((button): button is ButtonItem => button !== null)
      : []
    return { id, type: 'buttons', buttons, theme }
  }

  return null
}

export function normalizeBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((block, index) => normalizeBlock(block, index))
    .filter((block): block is ContentBlock => block !== null)
}

function normalizeImages(raw: unknown): ImageRef[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((image, index) => normalizeImageRef(image, `img-${index}`))
    .filter((image): image is ImageRef => image !== null)
}

/** Migrate legacy body/images fields into blocks when blocks are empty. */
function blocksFromLegacy(record: Record<string, unknown>): ContentBlock[] {
  const blocks = normalizeBlocks(record.blocks)
  if (blocks.length > 0) return blocks

  const migrated: ContentBlock[] = []
  if (typeof record.body === 'string' && record.body.trim()) {
    migrated.push({
      id: 'migrated-body',
      type: 'text',
      text: record.body,
      theme: 'bone',
      textAlign: 'left',
    })
  }
  for (const image of normalizeImages(record.images)) {
    migrated.push({
      id: `migrated-${image.id}`,
      type: 'image',
      image,
      theme: 'bone',
      imageFrame: 'framed',
      imageFit: 'crop',
    })
  }
  return migrated
}

function migrateLegacyHomeCta(
  record: Record<string, unknown>,
  blocks: ContentBlock[],
): ContentBlock[] {
  if (blocks.some((block) => block.type === 'buttons')) return blocks

  const ctaRecord = asRecord(record.cta)
  const label =
    typeof ctaRecord?.label === 'string' ? ctaRecord.label.trim() : ''
  const href = typeof ctaRecord?.href === 'string' ? ctaRecord.href.trim() : ''
  if (!label || !href) return blocks

  return [
    ...blocks,
    {
      id: 'migrated-cta',
      type: 'buttons',
      buttons: [{ id: 'migrated-cta-btn', label, href }],
      theme: 'bone',
    },
  ]
}

export function normalizePageContent(
  raw: unknown,
  fallbackTitle: string,
): PageContent {
  const record = asRecord(raw) ?? {}
  return {
    title: typeof record.title === 'string' ? record.title : fallbackTitle,
    blocks: blocksFromLegacy(record),
  }
}

function normalizeHeroPlacement(raw: unknown): 'under' | 'below' {
  return raw === 'under' ? 'under' : 'below'
}

export function normalizeHomePage(raw: unknown): HomePageContent {
  const record = asRecord(raw) ?? {}
  const heroImage = normalizeImageRef(record.heroImage, 'hero')

  return {
    title: typeof record.title === 'string' ? record.title : 'Welcome',
    heroImage,
    heroPlacement: normalizeHeroPlacement(record.heroPlacement),
    blocks: migrateLegacyHomeCta(record, blocksFromLegacy(record)),
  }
}

export function normalizeSiteContent(raw: SiteContent): SiteContent {
  return {
    ...raw,
    pages: {
      home: normalizeHomePage(raw.pages.home),
      howIWork: normalizePageContent(raw.pages.howIWork, 'How I Work'),
      fees: normalizePageContent(raw.pages.fees, 'Fees'),
      about: normalizePageContent(raw.pages.about, 'About Me'),
      contact: normalizePageContent(raw.pages.contact, 'Contact'),
      privacy: normalizePageContent(raw.pages.privacy, 'Privacy Policy'),
    },
  }
}
