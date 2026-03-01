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
import { dirname } from '@/utils/pathUtils'

interface MarkdownPreviewProps {
  content: string
  currentFilePath?: string
  onNavigate?: (path: string) => void
  wrapperRef?: RefObject<HTMLDivElement>
}

/** 파일 디렉토리 기준으로 상대 경로를 resolve */
function resolveRelativePath(dirPath: string, relativeSrc: string): string {
  const parts = dirPath ? dirPath.split('/') : []
  for (const part of relativeSrc.split('/')) {
    if (part === '..') parts.pop()
    else if (part !== '.') parts.push(part)
  }
  return parts.join('/')
}

/** 이미지 src를 GitHub raw URL로 변환 (절대 URL이면 그대로) */
function resolveImageSrc(src: string, currentFilePath: string, rawBaseUrl: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src
  const dir = dirname(currentFilePath)
  const resolved = resolveRelativePath(dir, src)
  return `${rawBaseUrl}/${encodeURI(resolved)}`
}

export function MarkdownPreview({ content, currentFilePath, onNavigate, wrapperRef }: MarkdownPreviewProps) {
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

  const imgComponent = useMemo(
    () => ({
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        const resolvedSrc =
          src && currentFilePath ? resolveImageSrc(src, currentFilePath, rawBaseUrl) : src
        return <img src={resolvedSrc} alt={alt} {...props} />
      },
    }),
    [currentFilePath, rawBaseUrl],
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
        components={imgComponent}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
