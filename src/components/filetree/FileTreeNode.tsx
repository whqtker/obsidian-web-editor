import { useState } from 'react'
import type { TreeNode } from '@/types/obsidian'

interface FileTreeNodeProps {
  node: TreeNode
  depth: number
  selectedPath: string | null
  onSelect: (path: string) => void
}

export function FileTreeNode({ node, depth, selectedPath, onSelect }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const isDir = node.type === 'directory'
  const isSelected = node.path === selectedPath

  const handleClick = () => {
    if (isDir) {
      setExpanded((prev) => !prev)
    } else {
      onSelect(node.path)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full text-left px-2 py-1 text-sm flex items-center gap-1.5 hover:bg-gray-800 rounded transition-colors ${
          isSelected ? 'bg-gray-800 text-white' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="shrink-0 w-4 text-center text-xs text-gray-500">
          {isDir ? (expanded ? '▾' : '▸') : ''}
        </span>
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
