import { Link } from 'react-router-dom'
import { equalColumnWidths } from '../content/columnWidths'
import type {
  BlockTheme,
  ContentBlock,
  ContentSection,
  ContentWidth,
  ImageSize,
} from '../content/types'
import { youtubeEmbedSrc } from '../content/videoEmbed'
import ContactForm from './ContactForm'
import FaqSection from './FaqSection'
import MarkdownContent from './MarkdownContent'

type ContentSectionsProps = {
  sections: ContentSection[]
}

function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

function widthClass(prefix: string, width: ContentWidth): string {
  return `${prefix}--width-${width}`
}

const IMAGE_SIZE_HEIGHTS: Record<Exclude<ImageSize, 'custom'>, string> = {
  small: '200px',
  medium: '360px',
  large: '520px',
}

function imageBlockHeight(
  size: ImageSize,
  customHeightPx: number,
): string {
  if (size === 'custom') {
    return `${Math.max(0, customHeightPx)}px`
  }
  return IMAGE_SIZE_HEIGHTS[size]
}

function themeClass(prefix: string, theme: BlockTheme): string {
  return `${prefix}--theme-${theme}`
}

function VideoEmbed({
  videoUrl,
  title,
}: {
  videoUrl: string
  title: string
}) {
  const src = youtubeEmbedSrc(videoUrl)
  if (!src) return null
  return (
    <div className="content-block__video">
      <iframe
        src={src}
        title={title.trim() || 'Embedded video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

function blockClassName(
  ...extras: Array<string | false | undefined>
): string {
  return ['content-block', ...extras.filter(Boolean)].join(' ')
}

function LeafBlock({
  block,
  sectionTheme,
}: {
  block: ContentBlock
  sectionTheme: BlockTheme
}) {
  const effectiveTheme = block.theme ?? sectionTheme
  const themeOverride = Boolean(block.theme)
  const widthOverride =
    block.type !== 'textOnImage' && block.contentWidth
      ? widthClass('content-block', block.contentWidth)
      : undefined

  if (block.type === 'text') {
    if (!block.text.trim()) return null
    return (
      <div
        className={blockClassName(
          'content-block--text',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
          `content-block--align-${block.textAlign}`,
        )}
      >
        <div className="content-block__inner">
          <MarkdownContent content={block.text} />
        </div>
      </div>
    )
  }

  if (block.type === 'image') {
    if (!block.image.src) return null
    return (
      <figure
        className={blockClassName(
          'content-block--image',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
          `content-block--frame-${block.imageFrame}`,
          `content-block--fit-${block.imageFit}`,
          `content-block--image-align-${block.imageAlign}`,
          `content-block--image-size-${block.imageSize}`,
        )}
        style={{
          ['--image-block-height' as string]: imageBlockHeight(
            block.imageSize,
            block.customHeightPx,
          ),
        }}
      >
        <div className="content-block__inner">
          <div className="content-block__image-shell">
            <img src={block.image.src} alt={block.image.alt || ''} />
          </div>
          {block.image.alt ? <figcaption>{block.image.alt}</figcaption> : null}
        </div>
      </figure>
    )
  }

  if (block.type === 'buttons') {
    const buttons = block.buttons.filter(
      (button) => button.label.trim() && button.href.trim(),
    )
    if (buttons.length === 0) return null
    return (
      <div
        className={blockClassName(
          'content-block--buttons',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
        )}
      >
        <div className="content-block__inner content-block__inner--buttons">
          {buttons.map((button) =>
            isInternalHref(button.href) ? (
              <Link
                key={button.id}
                to={button.href}
                className="content-block__button"
              >
                {button.label}
              </Link>
            ) : (
              <a
                key={button.id}
                href={button.href}
                className="content-block__button"
              >
                {button.label}
              </a>
            ),
          )}
        </div>
      </div>
    )
  }

  if (block.type === 'video') {
    if (!youtubeEmbedSrc(block.videoUrl)) return null
    return (
      <div
        className={blockClassName(
          'content-block--video',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
          `content-block--frame-${block.imageFrame}`,
        )}
      >
        <div className="content-block__inner">
          <VideoEmbed videoUrl={block.videoUrl} title={block.title} />
        </div>
      </div>
    )
  }

  if (block.type === 'textOnImage') {
    if (!block.image.src && !block.text.trim()) return null
    return (
      <div
        className={blockClassName(
          'content-block--text-on-image',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          `content-block--fit-${block.imageFit}`,
          `content-block--align-${block.textAlign}`,
        )}
      >
        <div className="content-block__inner content-block__inner--text-on-image">
          <div
            className={[
              'content-block__stage',
              widthClass('content-block__stage', block.imageWidth),
            ].join(' ')}
          >
            {block.image.src ? (
              <figure className="content-block__media">
                <img src={block.image.src} alt={block.image.alt || ''} />
              </figure>
            ) : null}
            {block.text.trim() ? (
              <div className="content-block__overlay">
                <div
                  className={[
                    'content-block__text',
                    widthClass('content-block__text', block.textWidth),
                  ].join(' ')}
                  style={{
                    ['--text-on-image-color' as string]: `var(--${block.textColor})`,
                  }}
                >
                  <MarkdownContent content={block.text} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (block.type === 'faq') {
    const hasItems = block.items.some(
      (item) => item.question.trim() || item.answer.trim(),
    )
    if (!hasItems) return null
    return (
      <div
        className={blockClassName(
          'content-block--faq',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
        )}
      >
        <div className="content-block__inner">
          <FaqSection
            items={block.items}
            heading={block.heading}
            subheading={block.subheading}
            headingId={`${block.id}-heading`}
          />
        </div>
      </div>
    )
  }

  if (block.type === 'contactForm') {
    return (
      <div
        className={blockClassName(
          'content-block--contact-form',
          'content-block--nested',
          themeOverride && themeClass('content-block', effectiveTheme),
          widthOverride,
        )}
      >
        <div className="content-block__inner">
          <ContactForm />
        </div>
      </div>
    )
  }

  return null
}

function sectionHasContent(section: ContentSection): boolean {
  return section.columns.some((column) => column.length > 0)
}

export default function ContentSections({ sections }: ContentSectionsProps) {
  const visible = sections.filter(sectionHasContent)
  if (visible.length === 0) return null

  return (
    <div className="content-sections">
      {visible.map((section) => (
        <section
          key={section.id}
          className={[
            'content-section',
            themeClass('content-section', section.theme),
            widthClass('content-section', section.contentWidth),
            `content-section--cols-${section.columnCount}`,
          ].join(' ')}
        >
          <div className="content-section__inner">
            <div
              className="content-section__grid"
              style={{
                ['--section-columns' as string]: String(section.columnCount),
                ['--section-column-widths' as string]: (
                  section.columnCount === 2
                    ? section.columnWidths
                    : equalColumnWidths(section.columnCount)
                )
                  .map((width) => `minmax(0, ${width}fr)`)
                  .join(' '),
              }}
            >
              {section.columns.map((column, columnIndex) => (
                <div
                  key={`${section.id}-col-${columnIndex}`}
                  className="content-section__column"
                >
                  {column.map((block) => (
                    <LeafBlock
                      key={block.id}
                      block={block}
                      sectionTheme={section.theme}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
