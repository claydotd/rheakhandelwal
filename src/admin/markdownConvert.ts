import { marked } from 'marked'
import TurndownService from 'turndown'

marked.setOptions({
  breaks: true,
  gfm: true,
})

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
})

turndown.addRule('underline', {
  filter: ['u'],
  replacement(content) {
    return `<u>${content}</u>`
  },
})

turndown.keep(['u'])

export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return ''
  return marked.parse(markdown, { async: false }) as string
}

export function htmlToMarkdown(html: string): string {
  const trimmed = html
    .replace(/^(<br\s*\/?>|&nbsp;|\s)+$/i, '')
    .replace(/^<div><br\s*\/?><\/div>$/i, '')
  if (!trimmed.trim()) return ''
  return turndown.turndown(html).trim()
}
