import { compileAdaptiveDisplay, wantsVisualization } from '@/lib/skulmate/display-contract'
import { retrieveCurriculum } from '@/lib/skulmate/curriculum-corpus'
import { hashSeed, uniqueVisualDataUri } from '@/lib/skulmate/unique-visual'
import { shouldBargeIn, utteranceReady } from '@/lib/skulmate/duplex'
import { rememberTurn, emptyMemory, memoryPromptBlock } from '@/lib/skulmate/learner-memory'
import { ttsModelChain, pickTutorVoice } from '@/lib/skulmate/engines/openrouter-tts'
import { OPENROUTER_SLUGS } from '@/lib/skulmate/engines/registry'
import { compileTurnContext } from '@/lib/skulmate/compile-turn-context'

describe('adaptive display', () => {
  it('does not make the board the only surface', () => {
    const play = compileAdaptiveDisplay({
      surface: {
        gameType: 'quiz',
        title: 'Your move',
        items: [{ question: 'Where?', options: ['A', 'B'], correctAnswer: 0 }],
      },
      message: 'Tap then say why',
      move: 'check',
      turnId: 't1',
    })
    expect(play.kind).toBe('play')

    const picture = compileAdaptiveDisplay({
      message: 'I cannot see how photosynthesis works. Draw it.',
      wantsImage: true,
      subjectId: 'biology',
      turnId: 't2',
    })
    expect(picture.kind).toBe('image')
    expect(picture.uniqueImage).toMatch(/^data:image\/svg/)
    expect(wantsVisualization('I do not understand, show a picture')).toBe(true)
  })

  it('keeps the algebra board when the equation is the idea', () => {
    const board = compileAdaptiveDisplay({
      board: {
        title: '2x+3=11',
        steps: [
          { kind: 'equation', text: '2x+3=11' },
          { kind: 'diagram', text: 'isolate:x' },
        ],
      },
      move: 'focus',
      turnId: 't3',
    })
    expect(board.kind).toBe('board')
    expect(board.visual.kind).toBe('balance')
  })
})

describe('curriculum RAG', () => {
  it('retrieves photosynthesis even if the profile subject is maths', () => {
    const hits = retrieveCurriculum({ query: 'photosynthesis in leaves', subjectId: 'maths' })
    expect(hits[0]?.content).toMatch(/chloroplast/i)
  })
  it('retrieves photosynthesis without any upload', () => {
    const hits = retrieveCurriculum({ query: 'photosynthesis in leaves', subjectId: 'biology' })
    expect(hits[0]?.content).toMatch(/chloroplast/i)
    expect(hits[0]?.artifactId).toBe('curriculum')
  })
})

describe('unique pictures', () => {
  it('changes the picture when the seed changes', () => {
    const a = uniqueVisualDataUri(hashSeed(['t1', 'bio']), 'biology')
    const b = uniqueVisualDataUri(hashSeed(['t2', 'bio']), 'biology')
    expect(a).not.toBe(b)
    expect(a).toMatch(/svg/)
  })
})

describe('full duplex barge-in', () => {
  it('interrupts when the learner adds words while Mate is speaking', () => {
    expect(
      shouldBargeIn({
        speaking: true,
        previousHeard: 'I think',
        nextHeard: 'I think the water left',
      })
    ).toBe(true)
    expect(
      shouldBargeIn({
        speaking: false,
        previousHeard: '',
        nextHeard: 'hello there',
      })
    ).toBe(false)
  })

  it('sends a spoken turn after silence, with no tap', () => {
    expect(
      utteranceReady({
        heard: 'the water left the bag',
        lastChangedAt: 0,
        now: 1600,
      })
    ).toBe(true)
    expect(
      utteranceReady({
        heard: 'hi',
        lastChangedAt: 0,
        now: 2000,
      })
    ).toBe(false)
  })
})

describe('learner growth memory', () => {
  it('records challenges and writes a prompt block without asking for notes', () => {
    const memory = rememberTurn({
      memory: emptyMemory('biology'),
      subjectId: 'biology',
      conceptId: 'biology:photosynthesis',
      label: 'Photosynthesis',
      correct: false,
      goal: 'Understand chloroplasts',
    })
    expect(memory.challenges[0]?.conceptId).toBe('biology:photosynthesis')
    const block = memoryPromptBlock(memory)
    expect(block).toMatch(/Diagnosed challenges/)
    expect(block).not.toMatch(/notes/)
  })
})

describe('OpenRouter neural TTS catalog', () => {
  it('fails over Grok Voice then Voxtral then MAI Voice', () => {
    expect(ttsModelChain()[0]).toBe(OPENROUTER_SLUGS.grokTts)
    expect(ttsModelChain()).toContain(OPENROUTER_SLUGS.voxtralTts)
    expect(pickTutorVoice('en')).toBe('eve')
    expect(pickTutorVoice('fr', OPENROUTER_SLUGS.voxtralTts)).toMatch(/fr_/)
  })
})

describe('turn context is curriculum-first', () => {
  it('does not stall when nothing was uploaded', () => {
    const compiled = compileTurnContext({
      accountRole: 'learner',
      learnerContext: { subjects: ['biology'], class_level: 'form5' },
      retrievedChunks: [],
    })
    expect(compiled.retrieved).toMatch(/No files uploaded/i)
    expect(compiled.retrieved).toMatch(/Do not ask for notes/)
    expect(compiled.identity).toMatch(/optional uploads/i)
    expect(compiled.full).toMatch(/DISPLAY/)
    expect(compiled.full).not.toMatch(/RETRIEVED NOTES/)
  })
})
