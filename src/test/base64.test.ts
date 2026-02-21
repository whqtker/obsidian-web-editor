import { encodeBase64, decodeBase64 } from '../utils/base64'

describe('base64', () => {
  it('round-trips ASCII text', () => {
    const text = 'Hello, World!'
    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })

  it('round-trips Korean text (multi-byte UTF-8)', () => {
    const text = '안녕하세요, 옵시디언 웹 에디터!'
    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })

  it('round-trips emoji', () => {
    const text = 'Hello 🌍🚀✨'
    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })

  it('handles newlines in base64 input', () => {
    const text = 'test'
    const encoded = encodeBase64(text)
    const withNewlines = encoded.slice(0, 2) + '\n' + encoded.slice(2)
    expect(decodeBase64(withNewlines)).toBe(text)
  })
})
