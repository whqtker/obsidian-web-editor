import { useState, useCallback, type RefObject } from 'react'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import type { EditorView } from '@codemirror/view'

// ─── CM6 helper functions ──────────────────────────────────────────────────

function getView(ref: RefObject<ReactCodeMirrorRef>): EditorView | null {
  return ref.current?.view ?? null
}

function toggleWrap(view: EditorView, before: string, after: string, placeholder: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)

  if (selected.length > 0) {
    // 이미 감싸져 있으면 제거, 아니면 감싸기
    if (selected.startsWith(before) && selected.endsWith(after) && selected.length > before.length + after.length) {
      const inner = selected.slice(before.length, selected.length - after.length)
      view.dispatch({
        changes: { from, to, insert: inner },
        selection: { anchor: from, head: from + inner.length },
      })
    } else {
      view.dispatch({
        changes: { from, to, insert: `${before}${selected}${after}` },
        selection: { anchor: from, head: to + before.length + after.length },
      })
    }
  } else {
    // 커서 위치에 플레이스홀더 삽입 후 선택
    view.dispatch({
      changes: { from, insert: `${before}${placeholder}${after}` },
      selection: { anchor: from + before.length, head: from + before.length + placeholder.length },
    })
  }
  view.focus()
}

function toggleHeading(view: EditorView, level: number) {
  const { head } = view.state.selection.main
  const line = view.state.doc.lineAt(head)
  const prefix = '#'.repeat(level) + ' '
  const stripped = line.text.replace(/^#{1,6} /, '')

  if (line.text.startsWith(prefix)) {
    // 같은 레벨이면 제거
    view.dispatch({ changes: { from: line.from, to: line.to, insert: stripped } })
  } else {
    // 다른 레벨 or 없음 → 적용
    view.dispatch({ changes: { from: line.from, to: line.to, insert: `${prefix}${stripped}` } })
  }
  view.focus()
}

function toggleBlockquote(view: EditorView) {
  const { head } = view.state.selection.main
  const line = view.state.doc.lineAt(head)

  if (line.text.startsWith('> ')) {
    view.dispatch({ changes: { from: line.from, to: line.from + 2, insert: '' } })
  } else {
    view.dispatch({ changes: { from: line.from, insert: '> ' } })
  }
  view.focus()
}

function insertCodeBlock(view: EditorView) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)

  if (selected.length > 0) {
    view.dispatch({ changes: { from, to, insert: `\`\`\`\n${selected}\n\`\`\`` } })
  } else {
    const insert = '```\n코드를 입력하세요\n```'
    view.dispatch({
      changes: { from, insert },
      selection: { anchor: from + 4, head: from + 4 + 9 },
    })
  }
  view.focus()
}

function insertLink(view: EditorView, url: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const text = selected.length > 0 ? selected : '링크 텍스트'
  const insert = `[${text}](${url})`
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  })
  view.focus()
}

// ─── Toolbar UI ───────────────────────────────────────────────────────────

interface MarkdownToolbarProps {
  editorRef: RefObject<ReactCodeMirrorRef>
}

const sep = <div className="w-px h-4 bg-gray-700 mx-0.5 shrink-0" />

type BtnProps = {
  onClick: () => void
  title: string
  children: React.ReactNode
  className?: string
}

function Btn({ onClick, title, children, className = '' }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault() // 포커스 유지
        onClick()
      }}
      className={`flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors text-xs font-medium shrink-0 ${className}`}
    >
      {children}
    </button>
  )
}

export function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const act = useCallback(
    (fn: (view: EditorView) => void) => {
      const view = getView(editorRef)
      if (view) fn(view)
    },
    [editorRef],
  )

  const handleLinkConfirm = useCallback(() => {
    if (!linkUrl.trim()) return
    act((v) => insertLink(v, linkUrl.trim()))
    setLinkMode(false)
    setLinkUrl('')
  }, [act, linkUrl])

  return (
    <div className="shrink-0 border-b border-gray-800 bg-gray-900">
      <div className="flex items-center gap-0.5 px-2 py-1 flex-wrap">
        {/* Headings */}
        {([1, 2, 3, 4] as const).map((n) => (
          <Btn key={n} title={`제목 ${n}`} onClick={() => act((v) => toggleHeading(v, n))}>
            H<sub>{n}</sub>
          </Btn>
        ))}

        {sep}

        {/* Bold */}
        <Btn title="굵게 (Ctrl+B)" onClick={() => act((v) => toggleWrap(v, '**', '**', '굵게'))}>
          <span className="font-bold">B</span>
        </Btn>

        {/* Italic */}
        <Btn title="기울임 (Ctrl+I)" onClick={() => act((v) => toggleWrap(v, '_', '_', '기울임'))}>
          <span className="italic">I</span>
        </Btn>

        {/* Strikethrough */}
        <Btn title="취소선" onClick={() => act((v) => toggleWrap(v, '~~', '~~', '취소선'))}>
          <span className="line-through">S</span>
        </Btn>

        {sep}

        {/* Blockquote */}
        <Btn title="인용" onClick={() => act(toggleBlockquote)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </Btn>

        {/* Link */}
        <Btn
          title="링크"
          onClick={() => {
            setLinkMode((v) => !v)
            setLinkUrl('')
          }}
          className={linkMode ? 'text-blue-400 bg-gray-700' : ''}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </Btn>

        {/* Code block */}
        <Btn title="코드 블록" onClick={() => act(insertCodeBlock)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </Btn>
      </div>

      {/* 링크 입력 행 */}
      {linkMode && (
        <div className="flex items-center gap-2 px-2 pb-1.5">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLinkConfirm()
              if (e.key === 'Escape') { setLinkMode(false); setLinkUrl('') }
            }}
            placeholder="https://example.com"
            className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleLinkConfirm() }}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            삽입
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setLinkMode(false); setLinkUrl('') }}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
