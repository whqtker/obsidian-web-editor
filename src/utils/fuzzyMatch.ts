/**
 * Simple fuzzy match: checks if all characters of query appear
 * in order within the target string (case-insensitive).
 * Returns match score (lower = better) or -1 if no match.
 */
export function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (q.length === 0) return 0

  let qi = 0
  let score = 0
  let lastMatchIdx = -1

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Bonus for consecutive matches
      const gap = lastMatchIdx === -1 ? 0 : ti - lastMatchIdx - 1
      score += gap
      lastMatchIdx = ti
      qi++
    }
  }

  // All query chars matched?
  if (qi < q.length) return -1

  // Bonus for matching at start of filename
  const lastSlash = target.lastIndexOf('/')
  const nameStart = lastSlash + 1
  if (t.indexOf(q, nameStart) === nameStart) {
    score -= 100 // Strong bonus for prefix match on filename
  }

  return score
}
