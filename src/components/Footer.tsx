import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_FOOTER } from '../content/normalize'
import type {
  FooterContent,
  FooterWidthMode,
  SitePaletteColor,
} from '../content/types'
import { useSiteContent } from '../content/useSiteContent'
import './Footer.css'

function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

function paletteVar(color: SitePaletteColor): string {
  return `var(--${color})`
}

function footerMaxWidth(
  mode: FooterWidthMode,
  customWidthRem: number,
): string {
  switch (mode) {
    case 'narrow':
      return '42rem'
    case 'medium':
      return '56rem'
    case 'wide':
      return '80rem'
    case 'content':
      return 'var(--content-width)'
    case 'custom':
      return `${customWidthRem}rem`
    case 'full':
    default:
      return 'none'
  }
}

function footerStyle(footer: FooterContent): CSSProperties {
  return {
    ['--footer-bg' as string]: paletteVar(footer.backgroundColor),
    ['--footer-text' as string]: paletteVar(footer.textColor),
    ['--footer-link' as string]: paletteVar(footer.linkColor),
    ['--footer-link-hover' as string]: paletteVar(footer.linkHoverColor),
    ['--footer-credit' as string]: paletteVar(footer.creditColor),
    ['--footer-padding-y' as string]: `${footer.paddingYRem}rem`,
    ['--footer-max-width' as string]: footerMaxWidth(
      footer.widthMode,
      footer.customWidthRem,
    ),
  }
}

export default function Footer() {
  const { content } = useSiteContent()
  const footer = content?.footer ?? DEFAULT_FOOTER
  const year = new Date().getFullYear()
  const links = footer.links.filter(
    (link) => link.label.trim() && link.href.trim(),
  )

  return (
    <footer className="site-footer" style={footerStyle(footer)}>
      <div className="site-footer__inner">
        <div className="site-footer__col site-footer__col--start">
          <p className="site-footer__copy">
            © {year} {footer.copyrightName}. All rights reserved.
          </p>
          {footer.email ? (
            <a className="site-footer__email" href={`mailto:${footer.email}`}>
              {footer.email}
            </a>
          ) : null}
          {footer.bacpRegistration.trim() ? (
            <p className="site-footer__bacp">
              BACP Registration: {footer.bacpRegistration}
            </p>
          ) : null}
        </div>

        <div className="site-footer__col site-footer__col--center" />

        <div className="site-footer__col site-footer__col--end">
          {links.map((link) =>
            isInternalHref(link.href) ? (
              <Link key={link.id} className="site-footer__link" to={link.href}>
                {link.label}
              </Link>
            ) : (
              <a
                key={link.id}
                className="site-footer__link"
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  link.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {link.label}
              </a>
            ),
          )}
          {footer.showCredit && footer.creditLabel.trim() ? (
            <span className="site-footer__credit">
              {footer.creditPrefix.trim()
                ? `${footer.creditPrefix.trim()} `
                : null}
              {footer.creditHref.trim() ? (
                <a
                  className="site-footer__credit-link"
                  href={footer.creditHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {footer.creditLabel}
                </a>
              ) : (
                footer.creditLabel
              )}
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
