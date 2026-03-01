import { useMemo, useCallback, useRef, type RefObject } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { wikilinkCompletion } from '@/editor/wikilink-completion'
import { useTreeStore } from '@/store/treeStore'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  onImageUpload?: (file: File) => Promise<string | null>
  editorRef?: RefObject<ReactCodeMirrorRef>
}

export function CodeMirrorEditor({ value, onChange, readOnly, onImageUpload, editorRef: externalRef }: CodeMirrorEditorProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)
  const internalRef = useRef<ReactCodeMirrorRef>(null)
  const editorRef = (externalRef ?? internalRef) as RefObject<ReactCodeMirrorRef>

  const insertText = useCallback((text: string) => {
    const view = editorRef.current?.view
    if (!view) return
    const cursor = view.state.selection.main.head
    view.dispatch({
      changes: { from: cursor, insert: text },
      selection: { anchor: cursor + text.length },
    })
  }, [])

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!onImageUpload) return false
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) return false

      for (const file of imageFiles) {
        const markdownText = await onImageUpload(file)
        if (markdownText) {
          insertText(markdownText + '\n')
        }
      }
      return true
    },
    [onImageUpload, insertText],
  )

  const extensions = useMemo(() => {
    const exts = [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      wikilinkCompletion(() => flatNodes.map((n) => n.path)),
    ]

    if (onImageUpload) {
      exts.push(
        EditorView.domEventHandlers({
          drop: (event) => {
            const files = event.dataTransfer?.files
            if (files && files.length > 0) {
              const hasImage = Array.from(files).some((f) => f.type.startsWith('image/'))
              if (hasImage) {
                event.preventDefault()
                handleFiles(files)
                return true
              }
            }
            return false
          },
          paste: (event) => {
            const files = event.clipboardData?.files
            if (files && files.length > 0) {
              const hasImage = Array.from(files).some((f) => f.type.startsWith('image/'))
              if (hasImage) {
                event.preventDefault()
                handleFiles(files)
                return true
              }
            }
            return false
          },
        }),
      )
    }

    return exts
  }, [flatNodes, onImageUpload, handleFiles])

  return (
    <CodeMirror
      ref={editorRef}
      value={value}
      height="100%"
      theme={oneDark}
      extensions={extensions}
      readOnly={readOnly}
      onChange={onChange}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: true,
      }}
      className="h-full text-sm"
    />
  )
}
