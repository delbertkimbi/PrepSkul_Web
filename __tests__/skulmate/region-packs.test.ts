import { packById, compileRegionContext, DEFAULT_REGION_ID, REGION_PACKS, t } from '@/lib/skulmate/region-packs'

describe('region packs', () => {
  it('defaults to Cameroon with both school worlds', () => {
    expect(DEFAULT_REGION_ID).toBe('cm')
    const cm = packById('cm')
    expect(cm.systems.map((s) => s.id)).toEqual(['cm-francophone', 'cm-anglophone'])
    expect(cm.cities.some((c) => c.id === 'yaounde')).toBe(true)
    expect(cm.cities.some((c) => c.id === 'douala')).toBe(true)
    expect(t(cm.label, 'fr')).toBe('Cameroun')
  })

  it('compiles Cameroon Francophone context for the model', () => {
    const notes = compileRegionContext({
      countryId: 'cm',
      cityId: 'yaounde',
      systemId: 'cm-francophone',
      levelId: '3eme',
      examId: 'bepc',
      examWhen: '3-6 months',
      locale: 'fr',
    })
    expect(notes).toContain('Cameroun')
    expect(notes).toContain('Yaoundé')
    expect(notes).toContain('BEPC')
    expect(notes).toContain('3ème')
    expect(notes).not.toMatch(/5th grade/)
    expect(notes).toMatch(/do not assume US grades/)
  })

  it('covers Africa before generic US/UK packs', () => {
    const ids = REGION_PACKS.map((p) => p.id)
    expect(ids.indexOf('cm')).toBeLessThan(ids.indexOf('ng'))
    expect(ids.indexOf('ng')).toBeLessThan(ids.indexOf('us'))
    expect(ids.indexOf('gh')).toBeLessThan(ids.indexOf('gb'))
  })
})
