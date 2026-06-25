import {
  buildLessonPlanPrompt,
  fallbackLessonPlan,
  normalizeLessonSteps,
  parseLessonPlanResponse,
} from '@/lib/skulmate/lesson-plan'

describe('lesson-plan D1', () => {
  it('buildLessonPlanPrompt includes topic and locale', () => {
    const prompt = buildLessonPlanPrompt({
      topic: 'Photosynthesis',
      locale: 'en',
      sourceText: 'Plants convert light to energy.',
    })
    expect(prompt).toContain('Photosynthesis')
    expect(prompt).toContain('English')
    expect(prompt).toContain('Plants convert light')
  })

  it('parses valid AI JSON', () => {
    const raw = JSON.stringify({
      topic: 'Fractions',
      steps: [
        { type: 'overview', title: 'Overview', body: 'Intro' },
        {
          type: 'concepts',
          title: 'Ideas',
          bullets: ['Numerator', 'Denominator'],
        },
        {
          type: 'drill',
          title: 'Practice',
          body: 'Drill',
          gameType: 'flashcards',
        },
        { type: 'quiz', title: 'Quiz', body: 'Test', gameType: 'quiz' },
        { type: 'recap', title: 'Done', body: 'Great job' },
      ],
    })
    const parsed = parseLessonPlanResponse(raw)
    expect(parsed.topic).toBe('Fractions')
    expect(parsed.steps).toHaveLength(5)
    expect(parsed.steps[2].gameType).toBe('flashcards')
  })

  it('normalizes steps with pending status', () => {
    const fallback = fallbackLessonPlan('Algebra', 'en')
    const steps = normalizeLessonSteps(fallback.steps)
    expect(steps.length).toBeGreaterThanOrEqual(4)
    expect(steps.every((s) => s.status === 'pending')).toBe(true)
    expect(steps.find((s) => s.type === 'quiz')?.gameType).toBe('quiz')
  })

  it('fallback plan is bilingual', () => {
    const fr = fallbackLessonPlan('Chimie', 'fr')
    expect(fr.steps[0].title).toContain('Aperçu')
    const en = fallbackLessonPlan('Chemistry', 'en')
    expect(en.steps[0].title).toContain('overview')
  })
})
