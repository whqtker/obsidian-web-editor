import { basename, isImage } from '@/utils/pathUtils'

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g

/**
 * Replace [[wikilinks]] with markdown links for react-markdown to render.
 * Image wikilinks are converted to real GitHub raw URLs when rawBaseUrl is provided.
 * Unresolved links get a strikethrough style.
 */
export function replaceWikiLinks(content: string, allPaths: string[], rawBaseUrl?: string): string {
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
      if (rawBaseUrl && isImage(resolved)) {
        return `![${label}](${rawBaseUrl}/${encodeURI(resolved)})`
      }
      return `[${label}](wikilink:${resolved}${heading})`
    }
    return `~~${label}~~`
  })
}

/**
 * Resolve a wikilink target to a full file path.
 * Obsidian uses shortest-path matching: "note" matches "folder/note.md"
 */
export function resolveWikiLink(
  target: string,
  allPaths: string[],
): string | null {
  if (!target) return null

  // Image files and files with explicit extensions are not .md — don't append suffix
  const hasExtension = /\.[^./]+$/.test(target)
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
