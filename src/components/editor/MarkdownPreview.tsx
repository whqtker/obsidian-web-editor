import { useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import { useTreeStore } from '@/store/treeStore'
import { resolveWikiLink } from '@/utils/wikilink'

interface MarkdownPreviewProps {
  content: string
  onNavigate?: (path: string) => void
}

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g

/**
 * Replace [[wikilinks]] with markdown links for react-markdown to render.
 * Unresolved links get a strikethrough style.
 */
function replaceWikiLinks(content: string, allPaths: string[]): string {
  return content.replace(WIKILINK_RE, (_match, inner: string) => {
    let target = inner
    let display: string | undefined

    const pipeIdx = inner.indexOf('|')
    if (pipeIdx !== -1) {
      display = inner.slice(pipeIdx + 1)
      target = inner.slice(0, pipeIdx)
    }

    const hashIdx = target.indexOf('#')
    let heading = ''
    if (hashIdx !== -1) {
      heading = target.slice(hashIdx)
      target = target.slice(0, hashIdx)
    }

    const resolved = resolveWikiLink(target, allPaths)
    const label = display || target || heading.slice(1)

    if (resolved) {
      return `[${label}](wikilink:${resolved}${heading})`
    }
    return `~~${label}~~`
  })
}

const INLINE_TAG_RE = /(?:^|\s)#([a-zA-Z\u3131-\uD79D][\w\u3131-\uD79D/\-]*)/g

/**
 * Replace inline #tags with styled HTML spans for preview.
 * Skips code blocks to avoid false matches.
 */
function replaceInlineTags(content: string): string {
  const parts = content.split(/(```[\s\S]*?```|`[^`]*`)/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part
    return part.replace(INLINE_TAG_RE, (match, tag) => {
      const leading = match.startsWith('#') ? '' : match[0]
      return `${leading}<span class="obsidian-tag">#${tag}</span>`
    })
  }).join('')
}

export function MarkdownPreview({ content, onNavigate }: MarkdownPreviewProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)
  const allPaths = useMemo(() => flatNodes.map((n) => n.path), [flatNodes])

  const processed = useMemo(
    () => replaceInlineTags(replaceWikiLinks(content, allPaths)),
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
      className="h-full overflow-y-auto p-6 prose prose-invert prose-sm max-w-none"
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
