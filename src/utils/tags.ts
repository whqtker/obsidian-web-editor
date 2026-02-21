const INLINE_TAG_RE = /(?:^|\s)#([a-zA-Z\u3131-\uD79D][\w\u3131-\uD79D/\-]*)/g

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
