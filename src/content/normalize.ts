import { equalColumnWidths, normalizeColumnWidths } from './columnWidths'
import type {
  BlockTheme,
  ButtonItem,
  ColumnCount,
  ContentBlock,
  ContentSection,
  ContentWidth,
  FaqItem,
  FooterContent,
  FooterWidthMode,
  HomePageContent,
  ImageAlign,
  ImageFit,
  ImageFrame,
  ImageRef,
  ImageSize,
  PageContent,
  SiteContent,
  SitePaletteColor,
  TextAlign,
} from './types'

const BLOCK_THEMES: BlockTheme[] = [
  'cream',
  'pale-honey',
  'yellow',
  'golden-honey',
  'lilac',
]
const TEXT_ALIGNS: TextAlign[] = ['left', 'center', 'right', 'justify']
const IMAGE_ALIGNS: ImageAlign[] = ['left', 'center', 'right']
const IMAGE_SIZES: ImageSize[] = ['small', 'medium', 'large', 'custom']
const CONTENT_WIDTHS: ContentWidth[] = [
  'narrow',
  'medium',
  'content',
  'wide',
  'full',
]
const COLUMN_COUNTS: ColumnCount[] = [1, 2, 3, 4]
const DEFAULT_CUSTOM_IMAGE_HEIGHT_PX = 400

function normalizeTheme(value: unknown): BlockTheme {
  // Migrate retired theme keys
  if (value === 'steel') return 'pale-honey'
  if (
    value === 'bone' ||
    value === 'sage' ||
    value === 'fawn' ||
    value === 'olive' ||
    value === 'slate'
  ) {
    return 'cream'
  }
  return BLOCK_THEMES.includes(value as BlockTheme)
    ? (value as BlockTheme)
    : 'yellow'
}

function normalizeOptionalTheme(value: unknown): BlockTheme | undefined {
  if (value === undefined || value === null) return undefined
  return normalizeTheme(value)
}

function normalizeImageFrame(value: unknown): ImageFrame {
  return value === 'full' ? 'full' : 'framed'
}

function normalizeImageFit(value: unknown): ImageFit {
  return value === 'contain' ? 'contain' : 'crop'
}

function normalizeImageAlign(value: unknown): ImageAlign {
  return IMAGE_ALIGNS.includes(value as ImageAlign)
    ? (value as ImageAlign)
    : 'center'
}

function normalizeImageSize(value: unknown): ImageSize {
  return IMAGE_SIZES.includes(value as ImageSize)
    ? (value as ImageSize)
    : 'large'
}

function normalizeTextAlign(
  value: unknown,
  fallback: TextAlign = 'left',
): TextAlign {
  return TEXT_ALIGNS.includes(value as TextAlign)
    ? (value as TextAlign)
    : fallback
}

function normalizeContentWidth(
  value: unknown,
  fallback: ContentWidth = 'content',
): ContentWidth {
  return CONTENT_WIDTHS.includes(value as ContentWidth)
    ? (value as ContentWidth)
    : fallback
}

function normalizeOptionalContentWidth(
  value: unknown,
): ContentWidth | undefined {
  if (value === undefined || value === null) return undefined
  return CONTENT_WIDTHS.includes(value as ContentWidth)
    ? (value as ContentWidth)
    : undefined
}

function normalizeColumnCount(value: unknown, fallback: ColumnCount = 1): ColumnCount {
  return COLUMN_COUNTS.includes(value as ColumnCount)
    ? (value as ColumnCount)
    : fallback
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

function normalizeFaqItem(value: unknown, index: number): FaqItem | null {
  const record = asRecord(value)
  if (!record) return null
  const question =
    typeof record.question === 'string' ? record.question.trim() : ''
  const answer = typeof record.answer === 'string' ? record.answer : ''
  if (!question && !answer.trim()) return null
  return {
    id: typeof record.id === 'string' ? record.id : `faq-${index}`,
    question,
    answer,
  }
}

function normalizeFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => normalizeFaqItem(item, index))
    .filter((item): item is FaqItem => item !== null)
}

function pageHasFaqBlock(page: PageContent): boolean {
  return page.sections.some((section) =>
    section.columns.some((column) =>
      column.some((block) => block.type === 'faq'),
    ),
  )
}

/** Move a legacy top-level `faq` array into an Approach page section. */
function migrateLegacyFaqIntoHowIWork(
  page: PageContent,
  legacyFaq: unknown,
): PageContent {
  if (pageHasFaqBlock(page)) return page
  const items = normalizeFaqItems(legacyFaq)
  if (items.length === 0) return page

  return {
    ...page,
    sections: [
      ...page.sections,
      {
        id: 'section-faq',
        theme: 'cream',
        contentWidth: 'content',
        columnCount: 1,
        columnWidths: [100],
        columns: [
          [
            {
              id: 'block-faq',
              type: 'faq',
              heading: 'FAQ',
              subheading: '',
              items,
            },
          ],
        ],
      },
    ],
  }
}

function pageHasContactFormBlock(page: PageContent): boolean {
  return page.sections.some((section) =>
    section.columns.some((column) =>
      column.some((block) => block.type === 'contactForm'),
    ),
  )
}

const CONTACT_FORM_BLOCK: ContentBlock = {
  id: 'block-contact-form',
  type: 'contactForm',
}

/**
 * Ensure the Contact page includes a contactForm block.
 * Prefer placing it beside existing single-column content (legacy two-up layout).
 */
function ensureContactFormBlock(page: PageContent): PageContent {
  if (pageHasContactFormBlock(page)) return page

  if (page.sections.length === 1 && page.sections[0].columnCount === 1) {
    const section = page.sections[0]
    return {
      ...page,
      sections: [
        {
          ...section,
          columnCount: 2,
          columnWidths: [60, 40],
          columns: [section.columns[0] ?? [], [CONTACT_FORM_BLOCK]],
        },
      ],
    }
  }

  return {
    ...page,
    sections: [
      ...page.sections,
      {
        id: 'section-contact-form',
        theme: 'cream',
        contentWidth: 'content',
        columnCount: 1,
        columnWidths: [100],
        columns: [[CONTACT_FORM_BLOCK]],
      },
    ],
  }
}

function withOverrides<T extends ContentBlock>(
  block: T,
  theme: BlockTheme | undefined,
  contentWidth: ContentWidth | undefined,
): T {
  const next = { ...block }
  if (theme !== undefined) next.theme = theme
  else delete next.theme
  if (block.type !== 'textOnImage') {
    if (contentWidth !== undefined) next.contentWidth = contentWidth
    else delete next.contentWidth
  }
  return next
}

/** Normalize a current leaf block (theme/width are optional overrides). */
function normalizeLeafBlock(
  value: unknown,
  index: number,
): ContentBlock | null {
  const record = asRecord(value)
  if (!record || typeof record.type !== 'string') return null

  const id = typeof record.id === 'string' ? record.id : `block-${index}`
  const theme = normalizeOptionalTheme(record.theme)
  const contentWidth = normalizeOptionalContentWidth(record.contentWidth)

  if (record.type === 'text') {
    return withOverrides(
      {
        id,
        type: 'text',
        text: typeof record.text === 'string' ? record.text : '',
        textAlign: normalizeTextAlign(record.textAlign),
      },
      theme,
      contentWidth,
    )
  }

  if (record.type === 'image') {
    const image = normalizeImageRef(record.image, `${id}-img`)
    if (!image) return null
    return withOverrides(
      {
        id,
        type: 'image',
        image,
        imageFrame: normalizeImageFrame(record.imageFrame),
        imageFit: normalizeImageFit(record.imageFit),
        imageAlign: normalizeImageAlign(record.imageAlign),
        imageSize: normalizeImageSize(record.imageSize),
        customHeightPx: normalizePositiveNumber(
          record.customHeightPx,
          DEFAULT_CUSTOM_IMAGE_HEIGHT_PX,
        ),
      },
      theme,
      contentWidth,
    )
  }

  if (record.type === 'textOnImage') {
    const image = normalizeImageRef(record.image, `${id}-img`)
    if (!image) return null
    return withOverrides(
      {
        id,
        type: 'textOnImage',
        image,
        text: typeof record.text === 'string' ? record.text : '',
        textAlign: normalizeTextAlign(record.textAlign, 'center'),
        textColor: normalizePaletteColor(record.textColor, 'white'),
        imageWidth: normalizeContentWidth(record.imageWidth, 'full'),
        textWidth: normalizeContentWidth(record.textWidth, 'narrow'),
        imageFit: normalizeImageFit(record.imageFit),
      },
      theme,
      undefined,
    )
  }

  if (record.type === 'buttons') {
    const buttons = Array.isArray(record.buttons)
      ? record.buttons
          .map((button, buttonIndex) => normalizeButton(button, buttonIndex))
          .filter((button): button is ButtonItem => button !== null)
      : []
    return withOverrides(
      {
        id,
        type: 'buttons',
        buttons,
      },
      theme,
      contentWidth,
    )
  }

  if (record.type === 'video') {
    const videoUrl =
      typeof record.videoUrl === 'string' ? record.videoUrl.trim() : ''
    if (!videoUrl) return null
    return withOverrides(
      {
        id,
        type: 'video',
        videoUrl,
        title: typeof record.title === 'string' ? record.title : '',
        imageFrame: normalizeImageFrame(record.imageFrame),
      },
      theme,
      contentWidth,
    )
  }

  if (record.type === 'faq') {
    return withOverrides(
      {
        id,
        type: 'faq',
        heading:
          typeof record.heading === 'string' ? record.heading.trim() : '',
        subheading:
          typeof record.subheading === 'string'
            ? record.subheading.trim()
            : '',
        items: normalizeFaqItems(record.items),
      },
      theme,
      contentWidth,
    )
  }

  if (record.type === 'contactForm') {
    return withOverrides(
      {
        id,
        type: 'contactForm',
      },
      theme,
      contentWidth,
    )
  }

  return null
}

function stripBandFields(block: ContentBlock): ContentBlock {
  const next = { ...block }
  delete next.theme
  if (next.type !== 'textOnImage') delete next.contentWidth
  return next
}

function columnFromBlocks(
  ...blocks: Array<ContentBlock | null>
): ContentBlock[] {
  return blocks.filter((block): block is ContentBlock => block !== null)
}

function sectionFromColumns(
  id: string,
  theme: BlockTheme,
  contentWidth: ContentWidth,
  columns: ContentBlock[][],
): ContentSection {
  const columnCount = normalizeColumnCount(columns.length)
  const padded: ContentBlock[][] = Array.from(
    { length: columnCount },
    (_, i) => columns[i] ?? [],
  )
  return {
    id,
    theme,
    contentWidth,
    columnCount,
    columnWidths: equalColumnWidths(columnCount),
    columns: padded,
  }
}

/** Accept a legacy single block, null, or an array of blocks. */
function normalizeColumn(value: unknown, columnIndex: number): ContentBlock[] {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value
      .map((entry, blockIndex) =>
        normalizeLeafBlock(entry, columnIndex * 100 + blockIndex),
      )
      .filter((block): block is ContentBlock => block !== null)
  }
  const block = normalizeLeafBlock(value, columnIndex)
  return block ? [block] : []
}

/**
 * Migrate a legacy flat/composite block into one or more sections.
 * imageText / textVideo become 2-column sections; everything else is 1-column.
 */
function migrateLegacyBlockToSections(
  value: unknown,
  index: number,
): ContentSection[] {
  const record = asRecord(value)
  if (!record || typeof record.type !== 'string') return []

  const id = typeof record.id === 'string' ? record.id : `block-${index}`
  const theme = normalizeTheme(record.theme)
  const contentWidth = normalizeContentWidth(record.contentWidth)

  if (record.type === 'imageText') {
    const image = normalizeImageRef(record.image, `${id}-img`)
    if (!image && !(typeof record.text === 'string' && record.text.trim())) {
      return []
    }
    const imageBlock: ContentBlock | null = image
      ? {
          id: `${id}-image`,
          type: 'image',
          image,
          imageFrame: normalizeImageFrame(record.imageFrame),
          imageFit: normalizeImageFit(record.imageFit),
          imageAlign: 'center',
          imageSize: 'large',
          customHeightPx: DEFAULT_CUSTOM_IMAGE_HEIGHT_PX,
        }
      : null
    const textBlock: ContentBlock | null =
      typeof record.text === 'string' && record.text.trim()
        ? {
            id: `${id}-text`,
            type: 'text',
            text: record.text,
            textAlign: 'left',
          }
        : null
    const columns =
      record.imagePosition === 'right'
        ? [columnFromBlocks(textBlock), columnFromBlocks(imageBlock)]
        : [columnFromBlocks(imageBlock), columnFromBlocks(textBlock)]
    return [sectionFromColumns(`section-${id}`, theme, contentWidth, columns)]
  }

  if (record.type === 'textVideo' || record.type === 'imageVideo') {
    const videoUrl =
      typeof record.videoUrl === 'string' ? record.videoUrl.trim() : ''
    const text = typeof record.text === 'string' ? record.text : ''
    if (!videoUrl && !text.trim()) return []

    const videoPosition =
      record.videoPosition === 'right' || record.videoPosition === 'left'
        ? record.videoPosition
        : record.imagePosition === 'right'
          ? 'right'
          : 'left'

    const textBlock: ContentBlock | null = text.trim()
      ? {
          id: `${id}-text`,
          type: 'text',
          text,
          textAlign: 'left',
        }
      : null
    const videoBlock: ContentBlock | null = videoUrl
      ? {
          id: `${id}-video`,
          type: 'video',
          videoUrl,
          title: typeof record.title === 'string' ? record.title : '',
          imageFrame: normalizeImageFrame(record.imageFrame),
        }
      : null

    const columns =
      videoPosition === 'left'
        ? [columnFromBlocks(videoBlock), columnFromBlocks(textBlock)]
        : [columnFromBlocks(textBlock), columnFromBlocks(videoBlock)]
    return [sectionFromColumns(`section-${id}`, theme, contentWidth, columns)]
  }

  // Already a leaf type — wrap as a 1-column section, inherit band from block.
  const leaf = normalizeLeafBlock(record, index)
  if (!leaf) return []
  return [
    sectionFromColumns(`section-${id}`, theme, contentWidth, [
      columnFromBlocks(stripBandFields(leaf)),
    ]),
  ]
}

function normalizeSection(
  value: unknown,
  index: number,
): ContentSection | null {
  const record = asRecord(value)
  if (!record) return null

  const id = typeof record.id === 'string' ? record.id : `section-${index}`
  const theme = normalizeTheme(record.theme)
  const contentWidth = normalizeContentWidth(record.contentWidth)
  const columnCount = normalizeColumnCount(record.columnCount)

  const rawColumns = Array.isArray(record.columns) ? record.columns : []
  const columns: ContentBlock[][] = Array.from(
    { length: columnCount },
    (_, columnIndex) => normalizeColumn(rawColumns[columnIndex], columnIndex),
  )

  return {
    id,
    theme,
    contentWidth,
    columnCount,
    columnWidths: normalizeColumnWidths(record.columnWidths, columnCount),
    columns,
  }
}

export function normalizeSections(raw: unknown): ContentSection[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((section, index) => normalizeSection(section, index))
    .filter((section): section is ContentSection => section !== null)
}

function normalizeImages(raw: unknown): ImageRef[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((image, index) => normalizeImageRef(image, `img-${index}`))
    .filter((image): image is ImageRef => image !== null)
}

/** Migrate legacy body/images fields into temporary block records. */
function legacyBlocksFromBodyImages(
  record: Record<string, unknown>,
): unknown[] {
  const migrated: unknown[] = []
  if (typeof record.body === 'string' && record.body.trim()) {
    migrated.push({
      id: 'migrated-body',
      type: 'text',
      text: record.body,
      theme: 'cream',
      contentWidth: 'content',
      textAlign: 'left',
    })
  }
  for (const image of normalizeImages(record.images)) {
    migrated.push({
      id: `migrated-${image.id}`,
      type: 'image',
      image,
      theme: 'cream',
      contentWidth: 'content',
      imageFrame: 'framed',
      imageFit: 'crop',
      imageAlign: 'center',
      imageSize: 'large',
      customHeightPx: DEFAULT_CUSTOM_IMAGE_HEIGHT_PX,
    })
  }
  return migrated
}

function migrateLegacyHomeCta(record: Record<string, unknown>, blocks: unknown[]): unknown[] {
  const hasButtons = blocks.some((block) => {
    const entry = asRecord(block)
    return entry?.type === 'buttons'
  })
  if (hasButtons) return blocks

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
      theme: 'cream',
      contentWidth: 'content',
    },
  ]
}

function sectionsFromPageRecord(
  record: Record<string, unknown>,
  options: { migrateHomeCta?: boolean } = {},
): ContentSection[] {
  if (Array.isArray(record.sections) && record.sections.length > 0) {
    return normalizeSections(record.sections)
  }

  let legacyBlocks: unknown[] = Array.isArray(record.blocks)
    ? record.blocks
    : []
  if (legacyBlocks.length === 0) {
    legacyBlocks = legacyBlocksFromBodyImages(record)
  }
  if (options.migrateHomeCta) {
    legacyBlocks = migrateLegacyHomeCta(record, legacyBlocks)
  }

  return legacyBlocks.flatMap((block, index) =>
    migrateLegacyBlockToSections(block, index),
  )
}

export function normalizePageContent(
  raw: unknown,
  fallbackTitle: string,
): PageContent {
  const record = asRecord(raw) ?? {}
  return {
    title: typeof record.title === 'string' ? record.title : fallbackTitle,
    sections: sectionsFromPageRecord(record),
  }
}

export function normalizeHomePage(raw: unknown): HomePageContent {
  const record = asRecord(raw) ?? {}

  return {
    title: typeof record.title === 'string' ? record.title : 'Welcome',
    sections: sectionsFromPageRecord(record, { migrateHomeCta: true }),
  }
}

const SITE_PALETTE_COLORS: SitePaletteColor[] = [
  'white',
  'pearl',
  'warm-cream',
  'pale-honey',
  'yellow',
  'golden-honey',
  'walnut',
  'lilac',
  'stone',
  'black',
]

const FOOTER_WIDTH_MODES: FooterWidthMode[] = [
  'narrow',
  'medium',
  'wide',
  'full',
  'content',
  'custom',
]

export const DEFAULT_FOOTER: FooterContent = {
  backgroundColor: 'walnut',
  textColor: 'pearl',
  linkColor: 'pearl',
  linkHoverColor: 'golden-honey',
  creditColor: 'lilac',
  widthMode: 'full',
  customWidthRem: 68,
  paddingYRem: 2,
  copyrightName: 'Rhea Khandelwal',
  email: 'hello@rheakhandelwaltherapy.co.uk',
  bacpRegistration: '000000',
  links: [
    { id: 'footer-privacy', label: 'Privacy Policy', href: '/privacy' },
    {
      id: 'footer-faq',
      label: 'Frequently Asked Questions',
      href: '/approach#block-faq-heading',
    },
  ],
  showCredit: true,
  creditPrefix: 'Built by',
  creditLabel: 'Analogue Gone Digital',
  creditHref: 'https://analoguegonedigital.co.uk',
}

function normalizePaletteColor(
  value: unknown,
  fallback: SitePaletteColor,
): SitePaletteColor {
  return SITE_PALETTE_COLORS.includes(value as SitePaletteColor)
    ? (value as SitePaletteColor)
    : fallback
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback
}

export function normalizeFooter(raw: unknown): FooterContent {
  const record = asRecord(raw) ?? {}
  const links = Array.isArray(record.links)
    ? record.links
        .map((link, index) => normalizeButton(link, index))
        .filter((link): link is ButtonItem => link !== null)
    : DEFAULT_FOOTER.links

  return {
    backgroundColor: normalizePaletteColor(
      record.backgroundColor,
      DEFAULT_FOOTER.backgroundColor,
    ),
    textColor: normalizePaletteColor(record.textColor, DEFAULT_FOOTER.textColor),
    linkColor: normalizePaletteColor(record.linkColor, DEFAULT_FOOTER.linkColor),
    linkHoverColor: normalizePaletteColor(
      record.linkHoverColor,
      DEFAULT_FOOTER.linkHoverColor,
    ),
    creditColor: normalizePaletteColor(
      record.creditColor,
      DEFAULT_FOOTER.creditColor,
    ),
    widthMode: FOOTER_WIDTH_MODES.includes(record.widthMode as FooterWidthMode)
      ? (record.widthMode as FooterWidthMode)
      : DEFAULT_FOOTER.widthMode,
    customWidthRem: normalizePositiveNumber(
      record.customWidthRem,
      DEFAULT_FOOTER.customWidthRem,
    ),
    paddingYRem: normalizePositiveNumber(
      record.paddingYRem,
      DEFAULT_FOOTER.paddingYRem,
    ),
    copyrightName:
      typeof record.copyrightName === 'string' && record.copyrightName.trim()
        ? record.copyrightName
        : DEFAULT_FOOTER.copyrightName,
    email:
      typeof record.email === 'string' && record.email.trim()
        ? record.email.trim()
        : DEFAULT_FOOTER.email,
    bacpRegistration:
      typeof record.bacpRegistration === 'string'
        ? record.bacpRegistration
        : DEFAULT_FOOTER.bacpRegistration,
    links: links.length > 0 ? links : DEFAULT_FOOTER.links,
    showCredit: record.showCredit !== false,
    creditPrefix:
      typeof record.creditPrefix === 'string'
        ? record.creditPrefix
        : DEFAULT_FOOTER.creditPrefix,
    creditLabel:
      typeof record.creditLabel === 'string' && record.creditLabel.trim()
        ? record.creditLabel
        : DEFAULT_FOOTER.creditLabel,
    creditHref:
      typeof record.creditHref === 'string' && record.creditHref.trim()
        ? record.creditHref.trim()
        : DEFAULT_FOOTER.creditHref,
  }
}

export function normalizeSiteContent(raw: SiteContent): SiteContent {
  const record = raw as SiteContent & { faq?: unknown }
  const howIWork = migrateLegacyFaqIntoHowIWork(
    normalizePageContent(raw.pages.howIWork, 'Approach'),
    record.faq,
  )

  return {
    version: 1,
    pages: {
      home: normalizeHomePage(raw.pages.home),
      howIWork,
      about: normalizePageContent(raw.pages.about, 'About Me'),
      contact: ensureContactFormBlock(
        normalizePageContent(raw.pages.contact, 'Contact'),
      ),
      privacy: normalizePageContent(raw.pages.privacy, 'Privacy Policy'),
    },
    footer: normalizeFooter(record.footer),
  }
}
