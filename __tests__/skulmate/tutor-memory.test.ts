import { chunkText, estimateTokens } from '@/lib/skulmate/chunk'
import { compileTurnContext } from '@/lib/skulmate/compile-turn-context'
import { validatePracticeSurface } from '@/lib/skulmate/surface-contract'
import { applyOutcomeToState } from '@/lib/skulmate/outcome-service'
import {
  recommendMoveFromEvidence,
  TUTOR_EVAL_FIXTURES,
} from '@/lib/skulmate/eval/tutor-eval'
import { getEngineConfig } from '@/lib/skulmate/engines/registry'
import { normalizeAccountRole } from '@/lib/skulmate/auth'
import {
  isAnswerDump,
  isFunnelingQuestion,
  verifyTutorTurn,
  focusingRewrite,
} from '@/lib/skulmate/pedagogy'
import { validateWhiteboard } from '@/lib/skulmate/whiteboard-contract'
import { buildSessionRecap } from '@/lib/skulmate/session-recap'

describe('chunkText', () => {
  it('splits long notes with overlap', () => {
    const text = 'word '.repeat(400)
    const chunks = chunkText(text, { maxChars: 80, overlap: 20 })
    expect(chunks.length).toBeGreaterThan(3)
    expect(chunks[0].tokenCount).toBe(estimateTokens(chunks[0].content))
  })

  it('returns empty for blank input', () => {
    expect(chunkText('   ')).toEqual([])
  })
})

describe('compileTurnContext', () => {
  it('treats parents as students, not bystanders or a caregiver voice', () => {
    const compiled = compileTurnContext({
      accountRole: 'parent',
      learnerContext: { language: 'en', class_level: 'Form 5' },
      recentTurns: [],
      retrievedChunks: [],
    })
    expect(compiled.identity).toContain('This person is the student')
    expect(compiled.identity).toContain('second person')
    expect(compiled.identity).toMatch(/caregiver voice/i)
    expect(compiled.identity).not.toContain('bystander')
    expect(compiled.identity).not.toMatch(/teach the child/i)
    expect(compiled.full).toContain('TOOLS')
    expect(compiled.tokenEstimate).toBeGreaterThan(50)
  })

  it('treats learners as the person to teach', () => {
    const compiled = compileTurnContext({
      accountRole: 'learner',
      recentOutcomes: [{ concept_id: 'cells', correct: false }],
      retrievedChunks: [
        { id: '1', artifactId: 'a', content: 'Mitochondria make ATP.' },
      ],
    })
    expect(compiled.identity).toContain('learner')
    expect(compiled.state).toContain('cells')
    expect(compiled.retrieved).toContain('Mitochondria')
  })

  it('trims retrieved notes when over budget', () => {
    const huge = 'alpha '.repeat(8000)
    const compiled = compileTurnContext({
      accountRole: 'learner',
      retrievedChunks: Array.from({ length: 8 }, (_, i) => ({
        id: String(i),
        artifactId: 'a',
        content: huge,
      })),
    })
    expect(compiled.tokenEstimate).toBeLessThan(6000)
  })
})

describe('surface contract', () => {
  it('accepts a short quiz', () => {
    const result = validatePracticeSurface({
      gameType: 'quiz',
      title: 'ATP',
      items: [
        {
          question: 'Where is ATP made?',
          options: ['Nucleus', 'Mitochondria', 'Vacuole', 'Cell wall'],
          correctAnswer: 1,
        },
      ],
    })
    expect(result.ok).toBe(true)
  })

  it('rejects empty matching', () => {
    const result = validatePracticeSurface({
      gameType: 'matching',
      items: [{ leftItem: 'x' }],
    })
    expect(result.ok).toBe(false)
  })
})

describe('outcome learning', () => {
  it('adds a miss to weak concepts and removes a hit', () => {
    const afterMiss = applyOutcomeToState(
      { weak_concepts: [] },
      'osmosis',
      false
    )
    expect(afterMiss.weak_concepts).toEqual([{ conceptId: 'osmosis' }])
    const afterHit = applyOutcomeToState(afterMiss, 'osmosis', true)
    expect(afterHit.weak_concepts).toEqual([])
  })
})

describe('tutor eval fixtures', () => {
  it('recommends focus, scaffold, escalate, independent, check from evidence', () => {
    for (const fixture of TUTOR_EVAL_FIXTURES) {
      expect(
        recommendMoveFromEvidence(
          fixture.lastOutcomes,
          fixture.independentDue
        )
      ).toBe(fixture.expectMove)
    }
  })
})

describe('engine registry', () => {
  it('exposes swappable engines', () => {
    expect(getEngineConfig('policy').kind).toBe('policy')
    expect(getEngineConfig('embed').costClass).toBe('cheap')
    expect(getEngineConfig('stt').id).toBe('stt.default')
  })
})

describe('account role', () => {
  it('maps parent and everything else to learner', () => {
    expect(normalizeAccountRole('parent')).toBe('parent')
    expect(normalizeAccountRole('student')).toBe('learner')
    expect(normalizeAccountRole(null)).toBe('learner')
  })
})

describe('student identity', () => {
  it('never tells the model to clone a parent voice', () => {
    const compiled = compileTurnContext({ accountRole: 'parent' })
    expect(compiled.identity).not.toMatch(/clone/i)
    expect(compiled.identity).toContain('Teach the speaker')
  })
})

describe('Aristotle-class pedagogy', () => {
  it('rejects funneling and answer dumps', () => {
    expect(isFunnelingQuestion('So that cancels, and you’re left with what?')).toBe(
      true
    )
    expect(isAnswerDump('The final answer is 42.')).toBe(true)
    const dumped = verifyTutorTurn({
      message: 'The final answer is 12. Just add 7 to both sides — what do you get?',
      move: 'focus',
    })
    expect(dumped.ok).toBe(false)
    if (!dumped.ok) {
      expect(dumped.rewrite.toLowerCase()).toContain('walk me through')
    }
  })

  it('lets a short focusing question through', () => {
    const ok = verifyTutorTurn({
      message: 'What do you notice about the top and the bottom?',
      move: 'focus',
      assistance: 'none',
    })
    expect(ok.ok).toBe(true)
    expect(focusingRewrite('osmosis')).toContain('osmosis')
  })

  it('validates a board without dumping a solution', () => {
    const board = validateWhiteboard({
      title: 'Forces',
      steps: [
        { kind: 'heading', text: 'Free-body' },
        { kind: 'diagram', text: 'Box on a ramp. Label mg, N, friction.' },
        { kind: 'prompt', text: 'Which force is along the ramp?' },
      ],
    })
    expect(board?.steps).toHaveLength(3)
  })

  it('builds a recap that credits student work', () => {
    const recap = buildSessionRecap({
      title: 'Forces',
      turns: [
        { role: 'user', text: 'Help me with the ramp problem' },
        { role: 'assistant', text: 'What forces are acting?' },
        { role: 'user', text: 'Gravity and the normal force I think' },
      ],
      weakConcepts: [{ conceptId: 'friction' }],
    })
    expect(recap.stuck).toContain('friction')
    expect(recap.studentDidTheWork).toBe(true)
  })
})
