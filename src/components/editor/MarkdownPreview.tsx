import { useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import { useTreeStore } from '@/store/treeStore'
import { replaceWikiLinks } from '@/utils/wikilink'
import { replaceTagsForPreview } from '@/utils/tags'

interface MarkdownPreviewProps {
  content: string
  onNavigate?: (path: string) => void
}

export function MarkdownPreview({ content, onNavigate }: MarkdownPreviewProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)
  const allPaths = useMemo(() => flatNodes.map((n) => n.path), [flatNodes])

  const processed = useMemo(
    () => replaceTagsForPreview(replaceWikiLinks(content, allPaths)),
    [content, allPaths],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (href?.startsWith('wikilink:')) {
        e.preventDefault()
        const path = href.slice('wikilink:'.length).split('#')[0]
        onNavigate?.(path)
      }
    },
    [onNavigate],
  )

  return (
    <div
      className="h-full overflow-y-auto p-6 markdown-body"
      onClick={handleClick}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
