import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
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
}

export function CodeMirrorEditor({ value, onChange, readOnly }: CodeMirrorEditorProps) {
  const flatNodes = useTreeStore((s) => s.flatNodes)

  const extensions = useMemo(() => [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    wikilinkCompletion(() => flatNodes.map((n) => n.path)),
  ], [flatNodes])

  return (
    <CodeMirror
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
