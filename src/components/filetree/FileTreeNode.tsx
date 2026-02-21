import { useState } from 'react'
import type { TreeNode } from '@/types/obsidian'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

interface FileTreeNodeProps {
  node: TreeNode
  depth: number
  selectedPath: string | null
  onSelect: (path: string) => void
  onNewFile: (directory: string) => void
}

export function FileTreeNode({ node, depth, selectedPath, onSelect, onNewFile }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const [showDelete, setShowDelete] = useState(false)
  const isDir = node.type === 'directory'
  const isSelected = node.path === selectedPath

  const handleClick = () => {
    if (isDir) {
      setExpanded((prev) => !prev)
    } else {
      onSelect(node.path)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isDir) {
      setShowDelete(true)
    }
  }

  return (
    <div>
      <div
        className={`group flex items-center hover:bg-gray-800 rounded transition-colors ${
          isSelected ? 'bg-gray-800 text-white' : 'text-gray-300'
        }`}
      >
        <button
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className="flex-1 text-left px-2 py-1 text-sm flex items-center gap-1.5 min-w-0"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="shrink-0 w-4 text-center text-xs text-gray-500">
            {isDir ? (expanded ? '▾' : '▸') : ''}
          </span>
          <span className="truncate">{node.name}</span>
        </button>

        {/* Directory: new file button */}
        {isDir && (
          <button
            onClick={(e) => { e.stopPropagation(); onNewFile(node.path) }}
            className="hidden group-hover:block px-1.5 text-gray-500 hover:text-gray-300 text-xs shrink-0"
            title="새 파일"
          >
            +
          </button>
        )}

        {/* File: delete button */}
        {!isDir && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            className="hidden group-hover:block px-1.5 text-gray-500 hover:text-red-400 text-xs shrink-0"
            title="삭제"
          >
            ×
          </button>
        )}
      </div>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onNewFile={onNewFile}
            />
          ))}
        </div>
      )}

      {showDelete && (
        <ConfirmDeleteDialog
          path={node.path}
          sha={node.sha}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
