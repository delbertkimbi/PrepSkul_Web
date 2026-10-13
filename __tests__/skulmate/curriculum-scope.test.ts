import { curriculumScope, scopePrompt, officialDomains } from '@/lib/skulmate/curriculum-scope'
import { matchCurriculumNodes } from '@/lib/skulmate/curriculum-matcher'
import { compileTurnContext } from '@/lib/skulmate/compile-turn-context'
import { trustedCitations } from '@/lib/skulmate/curriculum-lookup'

describe('learner curriculum scope', () => {
  const scope = { countryId: 'cm', systemId: 'cm-anglophone', levelId: 'form5', pathwayId: 'commercial', subjectId: 'accounting' }
  it('preserves the chosen path instead of inferring it from translated labels', () => {
    expect(curriculumScope({ curriculumScope: scope })).toEqual(scope)
    expect(scopePrompt({ curriculumScope: scope })).toContain('commercial')
  })
  it('does not use broad keyword seeds as proof of curriculum alignment', () => {
    expect(matchCurriculumNodes({ extractedText: 'photosynthesis chlorophyll light carbon dioxide', learnerContext: { curriculumScope: scope } })).toEqual([])
  })
  it('does not default unknown learners to Cameroon', () => {
    const result = compileTurnContext({ accountRole: 'learner' })
    expect(result.region).toContain('unknown')
    expect(officialDomains({ countryId: 'ng' })).toEqual([])
  })
  it('keeps explicit scope and evidence rules in the tutor context', () => {
    const result = compileTurnContext({ accountRole: 'learner', learnerContext: { curriculumScope: scope } })
    expect(result.full).toContain('commercial')
    expect(result.full).toContain('alignment is unverified')
    expect(result.full).toContain('ask one short question')
  })
  it('rejects fake authority URLs and uncited generated text', () => {
    expect(trustedCitations([
      { url: 'https://camgceb.org/syllabus', content: 'source excerpt' },
      { url: 'https://camgceb.org.evil.example/syllabus', content: 'bad' },
      { url: 'http://camgceb.org/syllabus', content: 'bad' },
      { url: 'https://camgceb.org/empty' },
    ], ['camgceb.org'])).toHaveLength(1)
  })
})
