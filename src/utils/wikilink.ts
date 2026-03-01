import { basename, isImage } from '@/utils/pathUtils'

// !? 로 선행 ! (Obsidian 임베드 문법)를 매칭 범위에 포함시켜 교체 시 이중 ! 생성을 방지
const WIKILINK_RE = /!?\[\[([^\]]+)\]\]/g
const HAS_EXTENSION_RE = /\.[^./]+$/

/**
 * Replace [[wikilinks]] and ![[embeds]] with markdown links for react-markdown to render.
 * Image embed wikilinks (![[image.png]]) are converted to ghimg:<path> custom scheme.
 * The custom img component in MarkdownPreview resolves ghimg: URLs via the authenticated GitHub API,
 * which enables image display in private repositories.
 * Unresolved links get a strikethrough style.
 */
export function replaceWikiLinks(content: string, allPaths: string[]): string {
  return content.replace(WIKILINK_RE, (match, inner: string) => {
    const isEmbed = match.startsWith('!')

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
      // 이미지 임베드: ![[image.png]] → ![alt](ghimg:encoded-path)
      // 경로 내 공백 등을 encodeURI로 인코딩해야 CommonMark 파서가 URL로 정상 인식함
      // GhImage 컴포넌트에서 decodeURI로 복원한 뒤 GitHub API를 호출함
      if (isEmbed && isImage(resolved)) {
        return `![${label}](ghimg:${encodeURI(resolved)})`
      }
      // 일반 위키링크 (이미지 포함): [[...]] → wikilink 앵커
      return `[${label}](wikilink:${resolved}${heading})`
    }
    return `~~${label}~~`
  })
}

/**
 * Resolve a wikilink target to a full file path.
 * Obsidian uses shortest-path matching: "note" matches "folder/note.md"
 */
function resolveWikiLink(
  target: string,
  allPaths: string[],
): string | null {
  if (!target) return null

  // Image files and files with explicit extensions are not .md — don't append suffix
  const hasExtension = HAS_EXTENSION_RE.test(target)
  const normalized = hasExtension ? target : `${target}.md`

  // Exact path match
  const exact = allPaths.find((p) => p === normalized)
  if (exact) return exact

  // Basename match (Obsidian default behavior)
  const byName = allPaths.find(
    (p) => basename(p) === normalized || basename(p) === target,
  )
  return byName ?? null
}
