import { planLocalTurn } from '@/lib/skulmate/engines/local-tutor'

describe('planLocalTurn', () => {
  it('asks what to isolate on a linear equation and never solves it', () => {
    const turn = planLocalTurn({
      userMessage: 'I need help with BEPC maths. I do not know how to start 2x+3=11.',
      suggestedMove: 'focus',
      language: 'en',
      recentTurns: [{ role: 'user', text: 'I need help with BEPC maths. I do not know how to start 2x+3=11.' }],
    })
    expect(turn.model).toBe('local')
    expect(turn.move).toBe('focus')
    expect(turn.message).toMatch(/isolate|standing alone|2x/i)
    expect(turn.message).not.toMatch(/x\s*=\s*4/)
    expect(turn.message).not.toMatch(/the answer is/i)
    expect(turn.board?.steps.some((s) => s.kind === 'equation')).toBe(true)
  })

  it('opens a first-move play after they name x, and never dumps x=4', () => {
    const turn = planLocalTurn({
      userMessage: 'I want x by itself',
      suggestedMove: 'scaffold',
      recentTurns: [
        { role: 'user', text: 'start 2x+3=11' },
        { role: 'assistant', text: 'What are you isolating?' },
        { role: 'user', text: 'I want x by itself' },
      ],
    })
    expect(turn.move).toBe('check')
    expect(turn.surface?.gameType).toBe('quiz')
    expect(turn.message).toMatch(/first move|why that one/i)
    expect(turn.message).not.toMatch(/x\s*=\s*4/)
    expect(turn.board?.title).toMatch(/2x/)
  })

  it('spawns a first-move quiz, not the value of x', () => {
    const turn = planLocalTurn({
      userMessage: 'I would subtract 3 first',
      suggestedMove: 'check',
      recentTurns: [
        { role: 'user', text: '2x+3=11' },
        { role: 'user', text: 'I would subtract 3 first' },
      ],
    })
    expect(turn.move).toBe('check')
    expect(turn.surface?.gameType).toBe('quiz')
    expect(JSON.stringify(turn.surface)).not.toMatch(/x\s*=\s*4/)
  })

  it('after a correct play, asks why then the next line, not x=4', () => {
    const turn = planLocalTurn({
      userMessage: 'I picked: Undo the constant term',
      suggestedMove: 'scaffold',
      recentTurns: [
        { role: 'user', text: '2x+3=11' },
        { role: 'assistant', text: 'Tap, then say why. Do not give x.' },
        { role: 'user', text: 'I picked: Undo the constant term' },
      ],
    })
    expect(turn.move).toBe('scaffold')
    expect(turn.surface).toBeUndefined()
    expect(turn.message).toMatch(/why that before dividing|next line/i)
    expect(turn.message).not.toMatch(/x\s*=\s*4/)
    expect(turn.board?.steps.some((s) => s.text === '2x = ?')).toBe(true)
  })

  it('on a wrong play, names the misconception and does not supply x=4', () => {
    const turn = planLocalTurn({
      userMessage: 'I picked: Divide by the coefficient of x',
      suggestedMove: 'scaffold',
      recentTurns: [
        { role: 'user', text: '2x+3=11' },
        { role: 'assistant', text: 'Which first move keeps the meaning of x? Tap one.' },
        { role: 'user', text: 'I picked: Divide by the coefficient of x' },
      ],
    })
    expect(turn.move).toBe('scaffold')
    expect(turn.misconception).toMatch(/divide|added/i)
    expect(turn.message).toMatch(/sitting with x|without computing/i)
    expect(turn.message).not.toMatch(/x\s*=\s*4/)
    expect(turn.surface).toBeUndefined()
  })

  it('after the next line, runs an independent transfer, not the same solve', () => {
    const turn = planLocalTurn({
      userMessage: 'I wrote 2x = 8',
      suggestedMove: 'independent',
      recentTurns: [
        { role: 'user', text: '2x+3=11' },
        { role: 'assistant', text: 'Write the next line of 2x+3=11, still without solving for x.' },
        { role: 'user', text: 'I wrote 2x = 8' },
      ],
    })
    expect(turn.move).toBe('independent')
    expect(turn.board?.title).toMatch(/5x/)
    expect(turn.message).toMatch(/same idea|asking you to do/i)
    expect(turn.message).not.toMatch(/x\s*=\s*4/)
    expect(turn.message).not.toMatch(/x\s*=\s*3/)
  })

  it('switches to photosynthesis even if they had chosen maths', () => {
    const turn = planLocalTurn({
      userMessage: 'Help me with photosynthesis',
      suggestedMove: 'focus',
      language: 'en',
      subjectId: 'maths',
      recentTurns: [
        { role: 'user', text: 'I need help with 2x+3=11' },
        { role: 'assistant', text: 'What are you isolating?' },
        { role: 'user', text: 'Help me with photosynthesis' },
      ],
    })
    expect(turn.conceptId).toMatch(/photosynthesis/)
    expect(turn.message).toMatch(/plant|chloroplast|light/i)
    expect(turn.message).not.toMatch(/isolate/)
  })

  it('keeps photosynthesis when they ask for a picture', () => {
    const turn = planLocalTurn({
      userMessage: 'I cannot see it. Draw a picture.',
      suggestedMove: 'scaffold',
      language: 'en',
      recentTurns: [
        { role: 'user', text: 'Help me with photosynthesis' },
        { role: 'assistant', text: 'Where in the plant does this change of light into stored energy actually happen?' },
        { role: 'user', text: 'I cannot see it. Draw a picture.' },
      ],
    })
    expect(turn.conceptId).toMatch(/photosynthesis/)
    expect(turn.displayHint).toBe('image')
    expect(turn.message).not.toMatch(/osmosis/i)
  })

  it('teaches photosynthesis from curriculum without requiring notes', () => {
    const turn = planLocalTurn({
      userMessage: 'I do not understand photosynthesis',
      suggestedMove: 'focus',
      language: 'en',
      subjectId: 'biology',
      recentTurns: [{ role: 'user', text: 'I do not understand photosynthesis' }],
    })
    expect(turn.message).toMatch(/chloroplast|where|plant|light/i)
    expect(turn.message).not.toMatch(/upload notes|paste your notes/i)
    expect(turn.displayHint).toBeTruthy()
    expect(turn.conceptId).toMatch(/photosynthesis/)
  })

  it('uses a pasted excerpt as extra context, not as a requirement', () => {
    const turn = planLocalTurn({
      userMessage: 'I pasted an excerpt',
      suggestedMove: 'focus',
      notes: 'Quantum tunnelling in semiconductors. Electrons can appear past a barrier.',
      recentTurns: [{ role: 'user', text: 'I pasted an excerpt' }],
    })
    expect(turn.message.length).toBeGreaterThan(20)
    expect(turn.message).not.toMatch(/I cannot teach without notes|upload notes|send notes/i)
  })
})
