import { replaceWikiLinks } from '@/utils/wikilink'

const ALL_PATHS = [
  'attachments/Pasted image 20260208223213.png',
  'attachments/photo.jpg',
  'notes/My Note.md',
  'notes/sub/Deep Note.md',
  'Root Note.md',
]
const RAW_BASE = 'https://raw.githubusercontent.com/owner/repo/main'

describe('replaceWikiLinks — 이미지 임베드 (![[...]])', () => {
  it('![[image.png]] → GitHub raw URL 이미지 마크다운으로 변환', () => {
    const result = replaceWikiLinks('![[Pasted image 20260208223213.png]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe(
      `![Pasted image 20260208223213.png](${RAW_BASE}/attachments/Pasted%20image%2020260208223213.png)`,
    )
  })

  it('![[image.png|alt text]] → alt 텍스트 사용', () => {
    const result = replaceWikiLinks('![[Pasted image 20260208223213.png|내 사진]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe(
      `![내 사진](${RAW_BASE}/attachments/Pasted%20image%2020260208223213.png)`,
    )
  })

  it('이중 ! 미생성 — 결과가 !! 로 시작하지 않아야 함', () => {
    const result = replaceWikiLinks('![[photo.jpg]]', ALL_PATHS, RAW_BASE)
    expect(result).not.toMatch(/^!!/)
    expect(result).toBe(`![photo.jpg](${RAW_BASE}/attachments/photo.jpg)`)
  })

  it('rawBaseUrl 없을 때 이미지 임베드도 wikilink로 처리', () => {
    const result = replaceWikiLinks('![[photo.jpg]]', ALL_PATHS)
    expect(result).toBe('[photo.jpg](wikilink:attachments/photo.jpg)')
  })

  it('미해결 이미지 임베드 → 취소선', () => {
    const result = replaceWikiLinks('![[nonexistent.png]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('~~nonexistent.png~~')
  })
})

describe('replaceWikiLinks — 일반 위키링크 ([[...]])', () => {
  it('[[note]] → wikilink 앵커로 변환', () => {
    const result = replaceWikiLinks('[[My Note]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('[My Note](wikilink:notes/My Note.md)')
  })

  it('[[note|display]] → display 텍스트 사용', () => {
    const result = replaceWikiLinks('[[My Note|노트 링크]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('[노트 링크](wikilink:notes/My Note.md)')
  })

  it('[[note#heading]] → heading 포함 wikilink', () => {
    const result = replaceWikiLinks('[[My Note#섹션1]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('[My Note](wikilink:notes/My Note.md#섹션1)')
  })

  it('[[image.png]] (일반 링크) → wikilink 앵커 (이미지 임베드 아님)', () => {
    const result = replaceWikiLinks('[[photo.jpg]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('[photo.jpg](wikilink:attachments/photo.jpg)')
  })

  it('미해결 링크 → 취소선', () => {
    const result = replaceWikiLinks('[[없는노트]]', ALL_PATHS, RAW_BASE)
    expect(result).toBe('~~없는노트~~')
  })
})

describe('replaceWikiLinks — 문장 내 혼합 사용', () => {
  it('본문 중간에 포함된 이미지 임베드 처리', () => {
    const result = replaceWikiLinks(
      '아래는 스크린샷이다.\n![[Pasted image 20260208223213.png]]\n다음 내용으로 넘어간다.',
      ALL_PATHS,
      RAW_BASE,
    )
    expect(result).toContain(
      `![Pasted image 20260208223213.png](${RAW_BASE}/attachments/Pasted%20image%2020260208223213.png)`,
    )
    expect(result).not.toContain('!![[')
    expect(result).not.toContain('!![')
  })

  it('위키링크와 이미지 임베드 혼합', () => {
    const input = '[[My Note]] 참고. ![[photo.jpg]]'
    const result = replaceWikiLinks(input, ALL_PATHS, RAW_BASE)
    expect(result).toBe(
      `[My Note](wikilink:notes/My Note.md) 참고. ![photo.jpg](${RAW_BASE}/attachments/photo.jpg)`,
    )
  })
})
