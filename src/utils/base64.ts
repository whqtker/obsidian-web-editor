const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function encodeBase64(text: string): string {
  const bytes = encoder.encode(text)
  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = bytes[i + 1] ?? 0
    const b2 = bytes[i + 2] ?? 0
    result += BASE64_CHARS[b0 >> 2]
    result += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)]
    result += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : '='
    result += i + 2 < bytes.length ? BASE64_CHARS[b2 & 0x3f] : '='
  }
  return result
}

export function decodeBase64(base64: string): string {
  const cleaned = base64.replace(/\n/g, '')
  const len = cleaned.length
  const bytes: number[] = []
  for (let i = 0; i < len; i += 4) {
    const c0 = BASE64_CHARS.indexOf(cleaned[i])
    const c1 = BASE64_CHARS.indexOf(cleaned[i + 1])
    const c2 = cleaned[i + 2] === '=' ? 0 : BASE64_CHARS.indexOf(cleaned[i + 2])
    const c3 = cleaned[i + 3] === '=' ? 0 : BASE64_CHARS.indexOf(cleaned[i + 3])
    bytes.push((c0 << 2) | (c1 >> 4))
    if (cleaned[i + 2] !== '=') bytes.push(((c1 & 0x0f) << 4) | (c2 >> 2))
    if (cleaned[i + 3] !== '=') bytes.push(((c2 & 0x03) << 6) | c3)
  }
  return decoder.decode(new Uint8Array(bytes))
}
