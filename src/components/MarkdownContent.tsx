import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

type MarkdownContentProps = {
  content: string
  className?: string
}

export default function MarkdownContent({
  content,
  className = 'markdown',
}: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  )
}
