import {
  buildCurriculumBackgroundPromptSection,
  matchCurriculumNodes,
  resolveBackgroundCurriculumAlignment,
} from '@/lib/skulmate/curriculum-matcher'

describe('curriculum-matcher background enrichment', () => {
  it('matches machine learning content to steam_ml_intro without blocking', () => {
    const text =
      'This YouTube lecture covers neural networks, training data, and supervised learning for beginners.'
    const alignment = resolveBackgroundCurriculumAlignment({
      extractedText: text,
      learnerContext: { enrichmentMode: 'background' },
    })
    const matches = matchCurriculumNodes({ extractedText: text })

    expect(matches[0]?.node.topic_id).toBe('steam_ml_intro')
    expect(['school_soft', 'open']).toContain(alignment.mode)
    expect(alignment.matchedTopicIds).toContain('steam_ml_intro')

    const prompt = buildCurriculumBackgroundPromptSection(alignment, matches)
    if (alignment.mode !== 'open') {
      expect(prompt).toContain('OPTIONAL CURRICULUM HINTS')
      expect(prompt).not.toContain('must be on syllabus')
    }
  })

  it('soft-matches GCE chemistry notes when learner has school context', () => {
    const text = `
      Electrolysis notes: cathode, anode, electrolyte, and products at electrodes.
      Molten lead bromide and aqueous copper sulfate examples.
    `
    const learnerContext = {
      enrichmentMode: 'background' as const,
      class_level: 'Form 5',
      exam: 'GCE O Level',
      subjects: ['Chemistry'],
    }
    const alignment = resolveBackgroundCurriculumAlignment({
      extractedText: text,
      learnerContext,
    })
    const matches = matchCurriculumNodes({ extractedText: text, learnerContext })

    expect(matches[0]?.node.topic_id).toBe('gce_ol_chem_electrolysis')
    expect(['school_matched', 'school_soft']).toContain(alignment.mode)
    expect(alignment.frameworkId).toBe('cm_gce_ol')
    expect(alignment.matchedTopicIds).toContain('gce_ol_chem_electrolysis')
  })

  it('returns open alignment for unrelated hobby content', () => {
    const alignment = resolveBackgroundCurriculumAlignment({
      extractedText: 'How to bake sourdough bread and maintain a starter culture at home.',
      learnerContext: { class_level: 'Form 3' },
    })
    expect(alignment.mode).toBe('open')
    expect(alignment.confidence).toBe(0)
    expect(
      buildCurriculumBackgroundPromptSection(alignment, [])
    ).toBe('')
  })
})
