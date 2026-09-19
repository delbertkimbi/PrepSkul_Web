import { mateVoiceText, MATE_VOICE_LINES } from '@/lib/skulmate/mate-voice-lines'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('SkulMate onboard voice', () => {
  it('keeps a closed catalogue of welcome lines', () => {
    expect(mateVoiceText('welcome', 'en')).toMatch(/I'm Mate/)
    expect(mateVoiceText('welcome', 'en')).not.toMatch(/Hi there/)
    expect(mateVoiceText('welcome_note', 'en')).toMatch(/SkulMate/)
    expect(mateVoiceText('welcome_note', 'en')).toMatch(/bring one in/)
    expect(mateVoiceText('welcome_note', 'en')).not.toMatch(/start with your school/)
    expect(mateVoiceText('welcome', 'fr')).toMatch(/Mate/)
    expect(mateVoiceText('welcome_note', 'fr')).toMatch(/SkulMate/)
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
    expect(player).toMatch(/prefetchMateLine/)
    expect(onboard).toMatch(/prefetchMateLine/)
    expect(onboard).toMatch(/armed=\{armed\}/)
    expect(onboard).not.toMatch(/onPointerDown=\{\(\) => void hearMate\(\)\}/)
    expect(route).toMatch(/en-NG-AbeoNeural/)
    expect(route).toMatch(/fr-FR-HenriNeural/)
    expect(route).toMatch(/SOFT_SPEED/)
    expect(route).toMatch(/friendly/)
    expect(player).toMatch(/CLIP_TONE = "soft"/)
    expect(player).toMatch(/pitch = 1.28/)
  })
})
