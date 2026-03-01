import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'

/**
 * Syncs the preview scroll position to the editor scroll position
 * by mapping scroll percentage. Only active when `enabled` is true.
 */
export function useScrollSync(
  editorRef: RefObject<ReactCodeMirrorRef>,
  previewRef: RefObject<HTMLDivElement>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    // The editor may not have rendered yet — try after a microtask
    let scrollEl: Element | null = null
    let cleanup: (() => void) | undefined

    const setup = () => {
      scrollEl = editorRef.current?.view?.scrollDOM ?? null
      const previewEl = previewRef.current
      if (!scrollEl || !previewEl) return false

      const handler = () => {
        const el = scrollEl as HTMLElement
        const scrollable = el.scrollHeight - el.clientHeight
        if (scrollable <= 0) return
        const pct = el.scrollTop / scrollable

        const previewScrollable = previewEl.scrollHeight - previewEl.clientHeight
        if (previewScrollable > 0) {
          previewEl.scrollTop = pct * previewScrollable
        }
      }

      scrollEl.addEventListener('scroll', handler, { passive: true })
      cleanup = () => scrollEl?.removeEventListener('scroll', handler)
      return true
    }

    if (!setup()) {
      const id = setTimeout(setup, 50)
      return () => {
        clearTimeout(id)
        cleanup?.()
      }
    }

    return () => cleanup?.()
  }, [editorRef, previewRef, enabled])
}
