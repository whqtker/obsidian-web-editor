import type { Frontmatter } from '@/types/obsidian'
import { parseFrontmatter } from '@/utils/frontmatter'

/**
 * Match inline #tags in markdown content.
 * Excludes tags inside code blocks, headings (## ), and URLs.
 */
const INLINE_TAG_RE = /(?:^|\s)#([a-zA-Z\u3131-\uD79D][\w\u3131-\uD79D/\-]*)/g

/**
 * Extract all unique tags from content (inline #tags + frontmatter tags).
 */
export function extractTags(content: string): string[] {
  const { frontmatter, body } = parseFrontmatter(content)
  const tagSet = new Set<string>()

  // Frontmatter tags
  if (frontmatter?.tags) {
    const fmTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags]
    for (const t of fmTags) {
      if (typeof t === 'string' && t.trim()) {
        tagSet.add(t.trim())
      }
    }
  }

  // Inline tags (skip code blocks)
  const withoutCode = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
  let match: RegExpExecArray | null
  while ((match = INLINE_TAG_RE.exec(withoutCode)) !== null) {
    tagSet.add(match[1])
  }

  return [...tagSet].sort()
}

/**
 * Replace inline #tags with styled spans for preview rendering.
 * Preserves tags inside code blocks untouched.
 */
export function replaceTagsForPreview(content: string): string {
  // Split by code blocks to avoid replacing inside them
  const parts = content.split(/(```[\s\S]*?```|`[^`]*`)/g)

  return parts.map((part, i) => {
    // Odd indices are code blocks — leave untouched
    if (i % 2 === 1) return part
    return part.replace(INLINE_TAG_RE, (match, tag) => {
      const leading = match.startsWith('#') ? '' : match[0]
      return `${leading}<span class="obsidian-tag">#${tag}</span>`
    })
  }).join('')
}
