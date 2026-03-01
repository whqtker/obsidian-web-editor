/**
 * Lightweight rehype plugin that strips XSS vectors while
 * preserving class/id attributes needed for hljs and KaTeX.
 *
 * Removes:
 *  - <script> and <style> elements
 *  - on* event handler attributes (onclick, onerror, …)
 *  - javascript:/data:/vbscript: in href/src/action attributes
 */
import type { Root, Element, RootContent } from 'hast'

const DANGEROUS_SCHEME = /^(javascript|data|vbscript):/i
const URL_ATTRS = new Set(['href', 'src', 'action', 'formAction'])

type Parent = { children: RootContent[] }

function walk(node: RootContent | Root, parent: Parent | null, index: number): number {
  if (node.type === 'element') {
    const el = node as Element
    if ((el.tagName === 'script' || el.tagName === 'style') && parent) {
      parent.children.splice(index, 1)
      return index - 1
    }
    if (el.properties) {
      for (const key of Object.keys(el.properties)) {
        if (/^on[A-Za-z]/.test(key)) {
          delete el.properties[key]
          continue
        }
        if (URL_ATTRS.has(key)) {
          const val = el.properties[key]
          if (typeof val === 'string' && DANGEROUS_SCHEME.test(val.trim())) {
            delete el.properties[key]
          }
        }
      }
    }
  }
  const children = (node as Root).children as RootContent[] | undefined
  if (Array.isArray(children)) {
    let i = 0
    while (i < children.length) {
      i = walk(children[i], node as Parent, i) + 1
    }
  }
  return index
}

export function rehypeSafeHtml() {
  return (tree: Root) => {
    walk(tree, null, 0)
  }
}
