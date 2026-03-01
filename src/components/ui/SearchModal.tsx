import { useState, useMemo, useEffect, useRef } from 'react'
import { useTreeStore } from '@/store/treeStore'
import { Modal } from '@/components/ui/Modal'
import { fuzzyMatch } from '@/utils/fuzzyMatch'
import { basename } from '@/utils/pathUtils'

interface SearchModalProps {
  onSelect: (path: string) => void
  onClose: () => void
}

export function SearchModal({ onSelect, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const flatNodes = useTreeStore((s) => s.flatNodes)

  const results = useMemo(() => {
    const files = flatNodes
      .filter((n) => n.type === 'blob')
      .map((n) => n.path)

    if (!query.trim()) {
      return files.slice(0, 30)
    }

    return files
      .map((path) => ({ path, score: fuzzyMatch(query, path) }))
      .filter((r) => r.score !== -1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 30)
      .map((r) => r.path)
  }, [flatNodes, query])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const selected = list.children[selectedIdx]
    if (selected instanceof HTMLElement) selected.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIdx((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIdx]) {
          onSelect(results[selectedIdx])
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  return (
    <Modal
      onClose={onClose}
      position="top"
      className="w-full max-w-md mx-4 shadow-2xl overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="파일명으로 검색..."
        className="w-full px-4 py-3 bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 border-b border-gray-700"
      />

      <div ref={listRef} className="max-h-64 overflow-y-auto">
        {results.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500">검색 결과가 없습니다.</p>
        ) : (
          results.map((path, i) => (
            <button
              key={path}
              onClick={() => { onSelect(path); onClose() }}
              className={`w-full text-left px-4 py-2 text-sm flex flex-col gap-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 ${
                i === selectedIdx
                  ? 'bg-blue-600/30 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="truncate">{basename(path)}</span>
              {path !== basename(path) && (
                <span className="text-xs text-gray-500 truncate">{path}</span>
              )}
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}
