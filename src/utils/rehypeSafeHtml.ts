/**
 * Lightweight rehype plugin that strips XSS vectors while
 * preserving class/id attributes needed for hljs and KaTeX.
 *
 * Removes:
 *  - <script> and <style> elements
 *  - on* event handler attributes (onclick, onerror, …)
 *  - javascript:/data:/vbscript: in href/src/action attributes
 */
import type { Root } from 'hast'

const DANGEROUS_SCHEME = /^(javascript|data|vbscript):/i

function walk(node: any, parent: any, index: number): number {
  if (node.type === 'element') {
    if ((node.tagName === 'script' || node.tagName === 'style') && parent) {
      parent.children.splice(index, 1)
      return index - 1
    }
    if (node.properties) {
      for (const key of Object.keys(node.properties as Record<string, unknown>)) {
        if (/^on[A-Za-z]/.test(key)) {
          delete (node.properties as any)[key]
          continue
        }
        if (['href', 'src', 'action', 'formAction'].includes(key)) {
          const val = (node.properties as any)[key]
          if (typeof val === 'string' && DANGEROUS_SCHEME.test(val.trim())) {
            delete (node.properties as any)[key]
          }
        }
      }
    }
  }
  if (Array.isArray(node.children)) {
    let i = 0
    while (i < node.children.length) {
      i = walk(node.children[i], node, i) + 1
    }
  }
  return index
}

export function rehypeSafeHtml() {
  return (tree: Root) => {
    walk(tree, null, 0)
  }
}
