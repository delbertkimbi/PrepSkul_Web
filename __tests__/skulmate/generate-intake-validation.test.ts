import { validateGenerateIntake } from '@/lib/skulmate/generate-intake-validation'

describe('validateGenerateIntake', () => {
  it('accepts topic-only requests without text', () => {
    const result = validateGenerateIntake({ topic: 'photosynthesis' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.isTopicOnlyMode).toBe(true)
      expect(result.trimmedTopic).toBe('photosynthesis')
      expect(result.trimmedText).toBe('')
    }
  })

  it('rejects short pasted text when not topic-only', () => {
    const result = validateGenerateIntake({ text: 'photosynthesis' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('50 characters')
      expect(result.status).toBe(400)
    }
  })

  it('accepts pasted text at least 50 characters', () => {
    const result = validateGenerateIntake({
      text: 'a'.repeat(50),
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.isTopicOnlyMode).toBe(false)
    }
  })

  it('rejects empty requests', () => {
    const result = validateGenerateIntake({})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('topic is required')
    }
  })

  it('does not treat topic+text as topic-only', () => {
    const result = validateGenerateIntake({
      topic: 'photosynthesis',
      text: 'a'.repeat(50),
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.isTopicOnlyMode).toBe(false)
    }
  })
})
