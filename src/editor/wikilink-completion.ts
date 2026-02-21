import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import { basename } from '@/utils/pathUtils'

/**
 * Creates a CM6 autocompletion extension for Obsidian [[wikilinks]].
 * When user types `[[`, shows matching .md file names from the tree.
 */
export function wikilinkCompletion(getFilePaths: () => string[]) {
  return autocompletion({
    override: [
      (context: CompletionContext): CompletionResult | null => {
        // Look for [[ before cursor
        const line = context.state.doc.lineAt(context.pos)
        const textBefore = line.text.slice(0, context.pos - line.from)

        // Find the last [[ that isn't closed
        const openIdx = textBefore.lastIndexOf('[[')
        if (openIdx === -1) return null

        // Check it's not already closed
        const afterOpen = textBefore.slice(openIdx + 2)
        if (afterOpen.includes(']]')) return null

        // Get query (text after [[ , before | if present)
        let query = afterOpen
        const pipeIdx = query.indexOf('|')
        if (pipeIdx !== -1) {
          // After pipe = display text, no completion needed
          return null
        }

        const from = line.from + openIdx + 2
        const queryLower = query.toLowerCase()

        const paths = getFilePaths()
        const options = paths
          .filter((p) => p.endsWith('.md'))
          .filter((p) => {
            const name = basename(p).replace(/\.md$/, '')
            return (
              name.toLowerCase().includes(queryLower) ||
              p.toLowerCase().includes(queryLower)
            )
          })
          .slice(0, 20)
          .map((p) => {
            const name = basename(p).replace(/\.md$/, '')
            return {
              label: name,
              detail: p !== `${name}.md` ? p : undefined,
              apply: `${name}]]`,
            }
          })

        if (options.length === 0) return null

        return {
          from,
          options,
          filter: false,
        }
      },
    ],
  })
}
