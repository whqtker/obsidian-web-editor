import type { WikiLink } from '@/types/obsidian'
import { basename } from '@/utils/pathUtils'

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g

/**
 * Parse all wikilinks from markdown content.
 * Supports: [[target]], [[target|display]], [[target#heading]]
 */
export function parseWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = []
  let match: RegExpExecArray | null

  while ((match = WIKILINK_RE.exec(content)) !== null) {
    const raw = match[0]
    let inner = match[1]
    let display: string | undefined

    // [[target|display]]
    const pipeIdx = inner.indexOf('|')
    if (pipeIdx !== -1) {
      display = inner.slice(pipeIdx + 1)
      inner = inner.slice(0, pipeIdx)
    }

    // [[target#heading]]
    let heading: string | undefined
    const hashIdx = inner.indexOf('#')
    if (hashIdx !== -1) {
      heading = inner.slice(hashIdx + 1)
      inner = inner.slice(0, hashIdx)
    }

    links.push({ raw, target: inner, display, heading })
  }

  return links
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

  const normalized = target.endsWith('.md') ? target : `${target}.md`

  // Exact path match
  const exact = allPaths.find((p) => p === normalized)
  if (exact) return exact

  // Basename match (Obsidian default behavior)
  const byName = allPaths.find(
    (p) => basename(p) === normalized || basename(p) === target,
  )
  return byName ?? null
}
