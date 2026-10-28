export type ImageRef = {
  id: string
  src: string
  alt: string
}

/** Background colour themes drawn from the site palette. */
export type BlockTheme = 'bone' | 'olive' | 'steel' | 'slate'

/** How an image sits within its block: padded inset, or flush to edges. */
export type ImageFrame = 'framed' | 'full'

/** Whether the image may be cropped to fill, or must show in full. */
export type ImageFit = 'crop' | 'contain'

/** Horizontal alignment for text within a text block. */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export type ImageBlock = {
  id: string
  type: 'image'
  image: ImageRef
  theme: BlockTheme
  imageFrame: ImageFrame
  imageFit: ImageFit
}

export type ImageTextBlock = {
  id: string
  type: 'imageText'
  image: ImageRef
  text: string
  imagePosition: 'left' | 'right'
  theme: BlockTheme
  imageFrame: ImageFrame
  imageFit: ImageFit
}

export type TextBlock = {
  id: string
  type: 'text'
  text: string
  theme: BlockTheme
  textAlign: TextAlign
}

export type ButtonItem = {
  id: string
  label: string
  href: string
}

export type ButtonsBlock = {
  id: string
  type: 'buttons'
  buttons: ButtonItem[]
  theme: BlockTheme
}

export type ContentBlock =
  | ImageBlock
  | ImageTextBlock
  | TextBlock
  | ButtonsBlock

export type PageContent = {
  title: string
  blocks: ContentBlock[]
}

export type HeroPlacement = 'under' | 'below'

export type HomePageContent = {
  title: string
  heroImage: ImageRef | null
  /** under = behind sticky header; below = flush under header (no gap) */
  heroPlacement: HeroPlacement
  blocks: ContentBlock[]
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type SiteContent = {
  version: 1
  pages: {
    home: HomePageContent
    howIWork: PageContent
    fees: PageContent
    about: PageContent
    contact: PageContent
    privacy: PageContent
  }
  faq: FaqItem[]
}

export type PageKey = keyof SiteContent['pages']
