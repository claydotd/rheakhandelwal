export type ImageRef = {
  id: string
  src: string
  alt: string
}

/** Background colour themes drawn from the site palette. */
export type BlockTheme =
  | 'cream'
  | 'pale-honey'
  | 'yellow'
  | 'golden-honey'
  | 'lilac'

/** How an image sits within its block: padded inset, or flush to edges. */
export type ImageFrame = 'framed' | 'full'

/** Whether the image may be cropped to fill, or must show in full. */
export type ImageFit = 'crop' | 'contain'

/** Horizontal alignment for a standalone image within its content area. */
export type ImageAlign = 'left' | 'center' | 'right'

/** Display size for a standalone image block. */
export type ImageSize = 'small' | 'medium' | 'large' | 'custom'

/** Horizontal alignment for text within a text block. */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

/** How wide a block's content is constrained within the themed band. */
export type ContentWidth = 'narrow' | 'medium' | 'content' | 'wide' | 'full'

/** Number of equal columns in a content section. */
export type ColumnCount = 1 | 2 | 3 | 4

/** Shared optional overrides — omit to inherit from the parent section. */
type BlockOverrides = {
  theme?: BlockTheme
  contentWidth?: ContentWidth
}

export type ImageBlock = BlockOverrides & {
  id: string
  type: 'image'
  image: ImageRef
  imageFrame: ImageFrame
  imageFit: ImageFit
  imageAlign: ImageAlign
  imageSize: ImageSize
  /** Used when imageSize is "custom" (px). */
  customHeightPx: number
}

/** Text overlaid on top of an image, each with its own content width. */
export type TextOnImageBlock = BlockOverrides & {
  id: string
  type: 'textOnImage'
  image: ImageRef
  text: string
  textAlign: TextAlign
  /** Colour of the overlaid text (site palette). */
  textColor: SitePaletteColor
  imageWidth: ContentWidth
  textWidth: ContentWidth
  imageFit: ImageFit
}

export type TextBlock = BlockOverrides & {
  id: string
  type: 'text'
  text: string
  textAlign: TextAlign
}

export type ButtonItem = {
  id: string
  label: string
  href: string
}

export type ButtonsBlock = BlockOverrides & {
  id: string
  type: 'buttons'
  buttons: ButtonItem[]
}

export type VideoBlock = BlockOverrides & {
  id: string
  type: 'video'
  /** YouTube watch/share/embed URL (or bare video id). */
  videoUrl: string
  /** Accessible title for the iframe. */
  title: string
  imageFrame: ImageFrame
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type FaqBlock = BlockOverrides & {
  id: string
  type: 'faq'
  /** Section heading shown above the accordion. */
  heading: string
  /** Optional supporting line under the heading. */
  subheading: string
  items: FaqItem[]
}

/** Renders the site contact form (fields are fixed, not CMS-edited). */
export type ContactFormBlock = BlockOverrides & {
  id: string
  type: 'contactForm'
}

export type ContentBlock =
  | ImageBlock
  | TextOnImageBlock
  | TextBlock
  | ButtonsBlock
  | VideoBlock
  | FaqBlock
  | ContactFormBlock

/** A full-bleed themed band containing 1–4 columns of content. */
export type ContentSection = {
  id: string
  theme: BlockTheme
  contentWidth: ContentWidth
  columnCount: ColumnCount
  /**
   * Relative column widths as percentages of the section row.
   * Length always equals columnCount; values always sum to 100.
   */
  columnWidths: number[]
  /** Length always equals columnCount; empty array = empty column. */
  columns: ContentBlock[][]
}

export type PageContent = {
  title: string
  sections: ContentSection[]
}

export type HomePageContent = {
  title: string
  sections: ContentSection[]
}

/** Named colours from the site palette (CSS custom properties). */
export type SitePaletteColor =
  | 'white'
  | 'pearl'
  | 'warm-cream'
  | 'pale-honey'
  | 'yellow'
  | 'golden-honey'
  | 'walnut'
  | 'lilac'
  | 'stone'
  | 'black'

export type FooterWidthMode =
  | 'narrow'
  | 'medium'
  | 'wide'
  | 'full'
  | 'content'
  | 'custom'

export type FooterContent = {
  backgroundColor: SitePaletteColor
  textColor: SitePaletteColor
  linkColor: SitePaletteColor
  linkHoverColor: SitePaletteColor
  creditColor: SitePaletteColor
  /** How the footer content is horizontally constrained. */
  widthMode: FooterWidthMode
  /** Used when widthMode is "custom" (rem). */
  customWidthRem: number
  /** Vertical padding (rem) — effectively controls footer height. */
  paddingYRem: number
  copyrightName: string
  email: string
  bacpRegistration: string
  links: ButtonItem[]
  showCredit: boolean
  creditPrefix: string
  creditLabel: string
  creditHref: string
}

export type SiteContent = {
  version: 1
  pages: {
    home: HomePageContent
    howIWork: PageContent
    about: PageContent
    contact: PageContent
    privacy: PageContent
  }
  footer: FooterContent
}

export type PageKey = keyof SiteContent['pages']
