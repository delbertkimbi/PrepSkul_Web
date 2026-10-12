import { lessonProgress, parseVoiceOut, shouldSpeak } from '@/lib/skulmate/lesson-mode'
import { compileLessonVisual, parseBalanceEquation } from '@/lib/skulmate/lesson-visual'
import { flushSpoken, speakableDelta } from '@/lib/skulmate/live-speech'

describe('voice preference', () => {
  it('defaults to Mate reading out loud, and mute is just a setting', () => {
    expect(parseVoiceOut(undefined)).toBe(true)
    expect(parseVoiceOut('silent')).toBe(false)
    expect(shouldSpeak(true)).toBe(true)
    expect(shouldSpeak(false)).toBe(false)
  })

  it('fills a Duo-style sky bar as the learner takes turns', () => {
    expect(lessonProgress(0)).toBeGreaterThan(0.1)
    expect(lessonProgress(8)).toBeLessThanOrEqual(0.92)
    expect(lessonProgress(3)).toBeGreaterThan(lessonProgress(1))
  })
})

describe('live speech', () => {
  it('speaks completed words as the typewriter advances, not the whole line at the end', () => {
    const full = 'You have 2x+3=11. What are you isolating?'
    expect(speakableDelta(full, 0, 3)).toBeNull()
    const first = speakableDelta(full, 0, 4)
    expect(first?.chunk).toBe('You ')
    const sentence = speakableDelta(full, 0, full.indexOf(' ') + 20)
    expect(sentence?.chunk).toMatch(/2x\+3=11\./)
    const flush = flushSpoken(full, full.length - 10)
    expect(flush?.chunk).toMatch(/isolating/)
  })
})

describe('lesson visuals', () => {
  it('turns a linear equation into a balance the learner can see', () => {
    const parsed = parseBalanceEquation('start 2x+3=11 now')
    expect(parsed?.left).toEqual(['2x', '+3'])
    expect(parsed?.right).toEqual(['11'])
    const visual = compileLessonVisual({
      board: {
        title: '2x+3=11',
        steps: [
          { kind: 'equation', text: '2x+3=11' },
          { kind: 'prompt', text: 'Name what you want standing alone.' },
        ],
      },
    })
    expect(visual.kind).toBe('balance')
    if (visual.kind === 'balance') {
      expect(visual.left).toContain('2x')
      expect(visual.beat).toBe('isolate')
      expect(visual.imagePrompt).toMatch(/balance scale/i)
      expect(visual.imagePrompt).not.toMatch(/—/)
    }
  })

  it('changes the board by beat: glued constant, then next line without x value', () => {
    const glued = compileLessonVisual({
      board: {
        title: '2x+3=11',
        steps: [
          { kind: 'equation', text: '2x+3=11' },
          { kind: 'diagram', text: 'glued:+3' },
          { kind: 'prompt', text: 'What is still sitting with x?' },
        ],
      },
    })
    expect(glued.kind).toBe('balance')
    if (glued.kind === 'balance') {
      expect(glued.beat).toBe('glued')
      expect(glued.highlight).toBe('+3')
    }
    const next = compileLessonVisual({
      board: {
        title: '2x+3=11',
        steps: [
          { kind: 'equation', text: '2x+3=11' },
          { kind: 'equation', text: '2x = ?' },
          { kind: 'diagram', text: 'next-line' },
          { kind: 'prompt', text: 'Next line, not the value of x.' },
        ],
      },
    })
    expect(next.kind).toBe('lines')
    if (next.kind === 'lines') {
      expect(next.lines[0].faded).toBe(true)
      expect(next.lines[1].text).toBe('2x = ?')
      expect(next.lines.map((l) => l.text).join(' ')).not.toMatch(/x\s*=\s*4/)
    }
  })

  it('turns notes into tappable cards, not a lecture dump', () => {
    const visual = compileLessonVisual({
      notes: 'Photosynthesis happens in chloroplasts. Light splits water.',
      board: {
        title: 'Your notes',
        steps: [
          { kind: 'note', text: 'Photosynthesis happens in chloroplasts.' },
          { kind: 'note', text: 'Light splits water.' },
        ],
      },
    })
    expect(visual.kind).toBe('notes')
    if (visual.kind === 'notes') {
      expect(visual.cards[0]).toMatch(/chloroplast/)
      expect(visual.imagePrompt).toMatch(/diagram/i)
    }
  })
})
