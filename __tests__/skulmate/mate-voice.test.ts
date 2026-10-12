import { mateVoiceText, MATE_VOICE_LINES } from '@/lib/skulmate/mate-voice-lines'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('SkulMate onboard voice', () => {
  it('keeps a closed catalogue of welcome lines', () => {
    expect(mateVoiceText('welcome', 'en')).toMatch(/I'm Mate/)
    expect(mateVoiceText('welcome', 'en')).not.toMatch(/Hi there/)
    expect(mateVoiceText('welcome_note', 'en')).toMatch(/understand your lessons/)
    expect(mateVoiceText('welcome_note', 'en')).toBe(
      "I'm here to help you understand your lessons, one step at a time. We'll start with what matters to you.",
    )
    expect(mateVoiceText('welcome_note', 'en')).not.toMatch(/start with your school/)
    expect(mateVoiceText('welcome', 'fr')).toMatch(/Mate/)
    expect(mateVoiceText('welcome_note', 'fr')).toMatch(/comprendre tes leçons/)
    expect(mateVoiceText('unknown', 'en')).toBeUndefined()
    expect(Object.keys(MATE_VOICE_LINES.en)).toEqual(Object.keys(MATE_VOICE_LINES.fr))
  })

  it('plays Mate out loud on web onboard instead of starting muted', () => {
    const onboard = readFileSync(join(process.cwd(), 'components/onboard/learner-onboard.tsx'), 'utf8')
    const player = readFileSync(join(process.cwd(), 'components/onboard/mate-voice.ts'), 'utf8')
    const route = readFileSync(join(process.cwd(), 'app/api/skulmate/voice/route.ts'), 'utf8')
    expect(onboard).toMatch(/mateVoiceText\("welcome"/)
    expect(onboard).toMatch(/speakMateLine\("welcome"/)
    expect(onboard).not.toMatch(/start with your school/)
    expect(onboard).not.toMatch(/Hi there/)
    expect(onboard).not.toMatch(/Tap to hear Mate/)
    expect(player).toMatch(/audio\.muted = false/)
    expect(player).not.toMatch(/audio\.muted = true/)
    expect(player).toMatch(/let scene = 0/)
    expect(player).toMatch(/AbortController/)
    expect(player).toMatch(/clipCache/)
    expect(player).toMatch(/v=\$\{revision\(text\)\}/)
    expect(player).toMatch(/prefetchMateLine/)
    expect(onboard).toMatch(/prefetchMateLine/)
    expect(onboard).toMatch(/armed=\{armed\}/)
    expect(onboard).not.toMatch(/onPointerDown=\{\(\) => void hearMate\(\)\}/)
    expect(route).toMatch(/SKULMATE_TTS_VOICE_EN/)
    expect(route).toMatch(/SKULMATE_TTS_VOICE_FR/)
    expect(route).toMatch(/Algieba/)
    expect(route).toMatch(/SOFT_SPEED/)
    expect(route).toMatch(/friendly/)
    expect(player).toMatch(/CLIP_TONE = "algieba-v3"/)
    expect(player).toMatch(/pitch = 1.03/)
  })
})
