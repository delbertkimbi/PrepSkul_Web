import {
  formatMatchedTopicsForOps,
  getFrameworkLabel,
  getTopicTitle,
} from '@/lib/skulmate/curriculum-labels'

describe('curriculum-labels admin helpers', () => {
  it('returns bilingual framework labels', () => {
    expect(getFrameworkLabel('cm_gce_ol', 'en')).toBe('GCE Ordinary Level')
    expect(getFrameworkLabel('cm_gce_ol', 'fr')).toBe('GCE niveau O')
  })

  it('returns bilingual topic titles for ops formatting', () => {
    expect(getTopicTitle('gce_ol_chem_electrolysis', 'en')).toBe('Electrolysis')
    expect(getTopicTitle('gce_ol_chem_electrolysis', 'fr')).toBe('Électrolyse')
    expect(formatMatchedTopicsForOps(['steam_ml_intro'], 'fr')).toEqual([
      'Introduction au machine learning',
    ])
  })
})
