import { useMemo, useCallback, type RefObject } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import { useTreeStore } from '@/store/treeStore'
import { useRepoStore } from '@/store/repoStore'
import { replaceWikiLinks } from '@/utils/wikilink'
import { replaceTagsForPreview } from '@/utils/tags'
import { rehypeSafeHtml } from '@/utils/rehypeSafeHtml'

interface MarkdownPreviewProps {
  content: string
  onNavigate?: (path: string) => void
  wrapperRef?: RefObject<HTMLDivElement>
}

export function MarkdownPreview({ content, onNavigate, wrapperRef }: MarkdownPreviewProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)
  const allPaths = useMemo(() => flatNodes.map((n) => n.path), [flatNodes])
  const { owner, repo, branch } = useRepoStore()
  const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`

  const processed = useMemo(
    () => replaceTagsForPreview(replaceWikiLinks(content, allPaths, rawBaseUrl)),
    [content, allPaths, rawBaseUrl],
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
      ref={wrapperRef}
      className="h-full overflow-y-auto p-6 markdown-body"
      onClick={handleClick}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug, rehypeKatex, rehypeSafeHtml]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
