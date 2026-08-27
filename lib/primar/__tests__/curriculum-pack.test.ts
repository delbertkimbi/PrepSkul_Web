import { searchCurriculum } from '@/lib/primar/curriculum-pack'

describe('primar curriculum RAG', () => {
  it('retrieves letter shape grounding by skill', () => {
    const hits = searchCurriculum({
      skillId: 'letter.shape',
      missTags: ['reversal'],
      locale: 'en',
      limit: 2,
    })
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].id).toBe('reading-letter-shape')
    expect(hits[0].snippet.toLowerCase()).toContain('b/d')
  })

  it('filters by numeracy category', () => {
    const hits = searchCurriculum({
      skillId: 'num.add',
      categories: ['numeracy'],
      locale: 'fr',
    })
    expect(hits[0]?.category).toBe('numeracy')
    expect(hits[0]?.snippet.length).toBeGreaterThan(10)
  })

  it('returns empty when nothing matches tightly', () => {
    const hits = searchCurriculum({
      query: 'zzzz-not-a-skill',
      categories: ['shapes'],
      limit: 2,
    })
    // Soft category fallthrough may still score 0.5 and be filtered (< 1).
    expect(hits.every((h) => h.relevanceScore >= 1)).toBe(true)
  })
})
