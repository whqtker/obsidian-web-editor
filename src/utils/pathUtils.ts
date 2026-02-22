import type { GitHubTreeNode } from '@/types/github'
import type { TreeNode } from '@/types/obsidian'

const HIDDEN_DIRS = ['.obsidian', '.git', '.trash']

function isHiddenPath(path: string): boolean {
  return HIDDEN_DIRS.some(
    (dir) => path === dir || path.startsWith(`${dir}/`),
  )
}

export function buildTreeFromFlat(flatNodes: GitHubTreeNode[]): TreeNode[] {
  const filtered = flatNodes.filter((n) => !isHiddenPath(n.path))

  const dirMap = new Map<string, TreeNode>()

  // 디렉토리 노드 먼저 생성
  for (const node of filtered) {
    if (node.type === 'tree') {
      dirMap.set(node.path, {
        name: basename(node.path),
        path: node.path,
        type: 'directory',
        children: [],
        sha: node.sha,
      })
    }
  }

  const root: TreeNode[] = []

  for (const node of filtered) {
    const treeNode: TreeNode =
      node.type === 'tree'
        ? dirMap.get(node.path)!
        : {
            name: basename(node.path),
            path: node.path,
            type: 'file',
            sha: node.sha,
          }

    const parentPath = dirname(node.path)
    if (parentPath === '') {
      root.push(treeNode)
    } else {
      const parent = dirMap.get(parentPath)
      if (parent) {
        parent.children!.push(treeNode)
      }
    }
  }

  sortTree(root)
  return root
}

function sortTree(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const node of nodes) {
    if (node.children) sortTree(node.children)
  }
}

export function basename(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? path : path.slice(idx + 1)
}

export function dirname(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? '' : path.slice(0, idx)
}

export function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/')
}

export function extname(path: string): string {
  const name = basename(path)
  const idx = name.lastIndexOf('.')
  return idx <= 0 ? '' : name.slice(idx)
}

export function isMarkdown(path: string): boolean {
  const ext = extname(path).toLowerCase()
  return ext === '.md' || ext === '.markdown'
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico']

export function isImage(path: string): boolean {
  return IMAGE_EXTENSIONS.includes(extname(path).toLowerCase())
}
