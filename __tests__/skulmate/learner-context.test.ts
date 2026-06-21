import {
  buildBackgroundLearnerPromptSection,
  resolveBackgroundCurriculumAlignment,
} from '@/lib/skulmate/learner-context'

describe('learner-context background policy', () => {
  it('always allows off-syllabus content in prompt guidance', () => {
    const section = buildBackgroundLearnerPromptSection({
      enrichmentMode: 'background',
      class_level: 'Form 5',
      subjects: ['Chemistry'],
      language: 'en',
    })
    expect(section).toContain('machine learning')
    expect(section).toContain('Never refuse')
    expect(section).not.toContain('must be on syllabus')
  })

  it('delegates alignment to curriculum matcher', () => {
    const alignment = resolveBackgroundCurriculumAlignment({
      extractedText: 'Introduction to neural networks and gradient descent',
      learnerContext: { class_level: 'Form 5' },
    })
    expect(alignment.matchedTopicIds?.length).toBeGreaterThan(0)
    expect(alignment.mode).not.toBe('school_matched')
  })

  it('empty context adds no prompt section', () => {
    expect(buildBackgroundLearnerPromptSection(null)).toBe('')
    expect(buildBackgroundLearnerPromptSection({})).toBe('')
  })
})
