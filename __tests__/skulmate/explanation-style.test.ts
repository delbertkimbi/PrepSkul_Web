import {
  buildExplanationStylePromptSection,
  buildExplainApiStyleInstruction,
  resolveExplanationStyle,
  stableExplanationStyleBucket,
} from '@/lib/skulmate/explanation-style'

describe('explanation-style C3', () => {
  it('maps survey visual hints to visual style', () => {
    expect(
      resolveExplanationStyle({
        learnerContext: { learning_style: 'Visual learner, loves diagrams' },
      })
    ).toBe('visual')
  })

  it('uses stable bucket when no survey style', () => {
    const a = stableExplanationStyleBucket('user-abc')
    const b = stableExplanationStyleBucket('user-abc')
    expect(a).toBe(b)
    expect(['visual', 'story', 'quiz_first']).toContain(a)
  })

  it('rotates style on weak-topic reroute', () => {
    expect(
      resolveExplanationStyle({
        weakTopicReroute: true,
        lastStyle: 'visual',
      })
    ).toBe('story')
  })

  it('builds silent prompt sections without learner-facing labels', () => {
    const section = buildExplanationStylePromptSection('story')
    expect(section).toContain('silent')
    expect(section).not.toContain('syllabus')
    expect(buildExplainApiStyleInstruction('quiz_first')).toContain('question')
  })
})
