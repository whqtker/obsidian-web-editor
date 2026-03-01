import { useMemo, useCallback, useState, useEffect, type RefObject } from 'react'
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
import { fetchImageUrl } from '@/api/contents'

/**
 * ghimg:<path> → GitHub API download_url 캐시
 * key: `${owner}/${repo}/${path}`, value: 인증된 download_url
 */
const imageUrlCache = new Map<string, string>()

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

/**
 * 이미지 src를 ghimg:<path> 로 변환 (절대 URL 등은 그대로 통과).
 * ghimg: 스킴은 GhImage 컴포넌트에서 GitHub API로 인증된 URL로 교체된다.
 */
function resolveImageSrc(src: string, currentFilePath: string): string {
  // 절대 URL, 프로토콜 상대(//), blob:, data:, 절대 경로(/), ghimg: 는 변환하지 않음
  if (
    /^https?:\/\//i.test(src) ||
    src.startsWith('//') ||
    src.startsWith('blob:') ||
    src.startsWith('data:') ||
    src.startsWith('/') ||
    src.startsWith('ghimg:')
  ) {
    return src
  }
  const dir = dirname(currentFilePath)
  const resolved = resolveRelativePath(dir, src)
  return `ghimg:${resolved}`
}

/**
 * ghimg:<path> 스킴을 처리하는 이미지 컴포넌트.
 * GitHub Contents API로 인증된 download_url을 가져와 렌더링한다.
 * Private 저장소에서도 이미지가 표시된다.
 */
function GhImage({
  src,
  alt,
  owner,
  repo,
  ...domProps
}: React.ImgHTMLAttributes<HTMLImageElement> & { owner: string; repo: string }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) return

    if (!src.startsWith('ghimg:')) {
      setResolvedUrl(src)
      return
    }

    const path = src.slice('ghimg:'.length)
    const cacheKey = `${owner}/${repo}/${path}`

    const cached = imageUrlCache.get(cacheKey)
    if (cached) {
      setResolvedUrl(cached)
      return
    }

    setResolvedUrl(undefined)
    setFailed(false)
    fetchImageUrl(owner, repo, path)
      .then(({ downloadUrl }) => {
        imageUrlCache.set(cacheKey, downloadUrl)
        setResolvedUrl(downloadUrl)
      })
      .catch(() => setFailed(true))
  }, [src, owner, repo])

  if (failed) {
    return <span className="text-xs text-red-400 font-mono">[이미지 로드 실패: {alt}]</span>
  }
  if (!resolvedUrl) {
    return <span className="inline-block w-24 h-6 bg-gray-700 rounded animate-pulse" />
  }
  return <img src={resolvedUrl} alt={alt} {...domProps} />
}

export function MarkdownPreview({ content, currentFilePath, onNavigate, wrapperRef }: MarkdownPreviewProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)
  const allPaths = useMemo(() => flatNodes.map((n) => n.path), [flatNodes])
  const { owner, repo } = useRepoStore()

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

  const imgComponent = useMemo(
    () => ({
      // node prop (hast element)은 DOM에 전달하지 않도록 destructure해서 제거
      img: ({ src, alt, node: _node, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }) => {
        const resolvedSrc =
          src && currentFilePath ? resolveImageSrc(src, currentFilePath) : src
        return <GhImage src={resolvedSrc} alt={alt} owner={owner} repo={repo} {...props} />
      },
    }),
    [currentFilePath, owner, repo],
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
