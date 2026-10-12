import { compileAdaptiveSurface, sentencesFromNotes } from '@/lib/skulmate/content-to-ui'
import { pickNaturalVoice, sttLangTag } from '@/lib/skulmate/voice'

describe('content-to-ui', () => {
  it('turns notes into a playable stuck-line check, not a dump', () => {
    const ui = compileAdaptiveSurface({
      notes: 'Photosynthesis happens in chloroplasts. Light splits water.',
      language: 'en',
    })
    expect(ui?.surface.gameType).toBe('quiz')
    expect(ui?.message).toMatch(/tap|talk/i)
    expect(ui?.message).not.toMatch(/the answer is/i)
    expect(ui?.board.steps.some((s) => s.text.includes('chloroplast'))).toBe(true)
    expect(sentencesFromNotes('One. Two is longer here. Three also longer.')).toHaveLength(2)
  })
})

describe('natural voices', () => {
  it('prefers a neural English voice', () => {
    const picked = pickNaturalVoice(
      [
        { name: 'eSpeak', lang: 'en-US', localService: true },
        { name: 'Google UK English Female', lang: 'en-GB', localService: false },
      ],
      'en'
    )
    expect(picked?.name).toMatch(/Google/)
  })

  it('uses French tags for STT', () => {
    expect(sttLangTag('fr-CM')).toBe('fr-FR')
    expect(sttLangTag('en')).toBe('en-GB')
  })
})
