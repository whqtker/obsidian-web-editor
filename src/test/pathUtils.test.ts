import { buildTreeFromFlat, basename, dirname, joinPath, extname, isMarkdown } from '../utils/pathUtils'
import type { GitHubTreeNode } from '../types/github'

describe('basename', () => {
  it('returns filename from path', () => {
    expect(basename('foo/bar/baz.md')).toBe('baz.md')
  })
  it('returns path itself when no slash', () => {
    expect(basename('file.md')).toBe('file.md')
  })
})

describe('dirname', () => {
  it('returns parent directory', () => {
    expect(dirname('foo/bar/baz.md')).toBe('foo/bar')
  })
  it('returns empty string for root-level file', () => {
    expect(dirname('file.md')).toBe('')
  })
})

describe('joinPath', () => {
  it('joins parts with slash', () => {
    expect(joinPath('foo', 'bar', 'baz')).toBe('foo/bar/baz')
  })
  it('filters empty parts', () => {
    expect(joinPath('', 'foo', '', 'bar')).toBe('foo/bar')
  })
})

describe('extname / isMarkdown', () => {
  it('returns extension', () => {
    expect(extname('note.md')).toBe('.md')
    expect(extname('image.png')).toBe('.png')
  })
  it('returns empty for no extension', () => {
    expect(extname('README')).toBe('')
  })
  it('detects markdown files', () => {
    expect(isMarkdown('note.md')).toBe(true)
    expect(isMarkdown('note.markdown')).toBe(true)
    expect(isMarkdown('image.png')).toBe(false)
  })
})

describe('buildTreeFromFlat', () => {
  const makeNode = (path: string, type: 'blob' | 'tree'): GitHubTreeNode => ({
    path,
    type,
    sha: `sha-${path}`,
    mode: type === 'tree' ? '040000' : '100644',
  })

  it('builds nested tree from flat nodes', () => {
    const flat: GitHubTreeNode[] = [
      makeNode('docs', 'tree'),
      makeNode('docs/note.md', 'blob'),
      makeNode('README.md', 'blob'),
    ]
    const tree = buildTreeFromFlat(flat)

    expect(tree).toHaveLength(2)
    // directories first
    expect(tree[0].name).toBe('docs')
    expect(tree[0].type).toBe('directory')
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children![0].name).toBe('note.md')
    // then files
    expect(tree[1].name).toBe('README.md')
  })

  it('filters out .obsidian directory', () => {
    const flat: GitHubTreeNode[] = [
      makeNode('.obsidian', 'tree'),
      makeNode('.obsidian/workspace.json', 'blob'),
      makeNode('note.md', 'blob'),
    ]
    const tree = buildTreeFromFlat(flat)

    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('note.md')
  })

  it('filters out .git and .trash directories', () => {
    const flat: GitHubTreeNode[] = [
      makeNode('.git', 'tree'),
      makeNode('.trash', 'tree'),
      makeNode('.trash/deleted.md', 'blob'),
      makeNode('note.md', 'blob'),
    ]
    const tree = buildTreeFromFlat(flat)

    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('note.md')
  })

  it('sorts directories before files, then alphabetically', () => {
    const flat: GitHubTreeNode[] = [
      makeNode('z-file.md', 'blob'),
      makeNode('b-dir', 'tree'),
      makeNode('a-file.md', 'blob'),
      makeNode('a-dir', 'tree'),
    ]
    const tree = buildTreeFromFlat(flat)

    expect(tree.map((n) => n.name)).toEqual(['a-dir', 'b-dir', 'a-file.md', 'z-file.md'])
  })

  it('handles empty input', () => {
    expect(buildTreeFromFlat([])).toEqual([])
  })
})
