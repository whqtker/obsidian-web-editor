import yaml from 'js-yaml'
import type { Frontmatter } from '@/types/obsidian'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/

export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter | null
  body: string
} {
  const match = content.match(FRONTMATTER_RE)
  if (!match) {
    return { frontmatter: null, body: content }
  }

  try {
    const parsed = yaml.load(match[1])
    const frontmatter = (parsed && typeof parsed === 'object' ? parsed : null) as Frontmatter | null
    const body = content.slice(match[0].length).replace(/^\r?\n/, '')
    return { frontmatter, body }
  } catch {
    return { frontmatter: null, body: content }
  }
}
