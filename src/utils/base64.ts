const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function encodeBase64(text: string): string {
  const bytes = encoder.encode(text)
  const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join('')
  return btoa(binString)
}

export function decodeBase64(base64: string): string {
  const cleaned = base64.replace(/\n/g, '')
  const binString = atob(cleaned)
  const bytes = Uint8Array.from(binString, (c) => c.codePointAt(0)!)
  return decoder.decode(bytes)
}
