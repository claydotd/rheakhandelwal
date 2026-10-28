import { Link } from 'react-router-dom'
import type { ContentBlock } from '../content/types'
import MarkdownContent from './MarkdownContent'

type ContentBlocksProps = {
  blocks: ContentBlock[]
}

function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

function blockClassName(
  block: ContentBlock,
  ...extras: Array<string | false | undefined>
): string {
  return [
    'content-block',
    `content-block--theme-${block.theme}`,
    ...extras.filter(Boolean),
  ].join(' ')
}

export default function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (blocks.length === 0) return null

  return (
    <div className="content-blocks">
      {blocks.map((block) => {
        if (block.type === 'text') {
          return (
            <section
              key={block.id}
              className={blockClassName(
                block,
                'content-block--text',
                `content-block--align-${block.textAlign}`,
              )}
            >
              <div className="content-block__inner">
                <MarkdownContent content={block.text} />
              </div>
            </section>
          )
        }

        if (block.type === 'image') {
          if (!block.image.src) return null
          return (
            <figure
              key={block.id}
              className={blockClassName(
                block,
                'content-block--image',
                `content-block--frame-${block.imageFrame}`,
                `content-block--fit-${block.imageFit}`,
              )}
            >
              <div className="content-block__inner">
                <img src={block.image.src} alt={block.image.alt || ''} />
                {block.image.alt ? (
                  <figcaption>{block.image.alt}</figcaption>
                ) : null}
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
              key={block.id}
              className={blockClassName(block, 'content-block--buttons')}
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

        if (!block.image.src && !block.text.trim()) return null

        return (
          <section
            key={block.id}
            className={blockClassName(
              block,
              'content-block--image-text',
              `content-block--image-${block.imagePosition}`,
              `content-block--frame-${block.imageFrame}`,
              `content-block--fit-${block.imageFit}`,
            )}
          >
            <div className="content-block__inner content-block__inner--image-text">
              {block.image.src ? (
                <figure className="content-block__media">
                  <img src={block.image.src} alt={block.image.alt || ''} />
                </figure>
              ) : null}
              {block.text.trim() ? (
                <div className="content-block__text">
                  <MarkdownContent content={block.text} />
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
