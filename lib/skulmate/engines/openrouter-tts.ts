/**
 * Cloud neural TTS through OpenRouter.
 * POST https://openrouter.ai/api/v1/audio/speech
 * Default: x-ai/grok-voice-tts-1.0. Failover: voxtral, then mai-voice-2.
 * The client falls back to the device voice if this returns no audio.
 */

import { getSkulMateApiKeys } from '../auth'
import { OPENROUTER_SLUGS } from './registry'

const OPENROUTER_SPEECH = 'https://openrouter.ai/api/v1/audio/speech'

export type SpeechArgs = {
  text: string
  language?: string
  voice?: string
  model?: string
}

export type SpeechResult = {
  audio: Buffer
  contentType: string
  model: string
}

export function ttsModelChain(): string[] {
  const pinned = process.env.SKULMATE_TTS_MODEL
  const chain = [
    OPENROUTER_SLUGS.grokTts,
    OPENROUTER_SLUGS.voxtralTts,
    OPENROUTER_SLUGS.maiTts,
  ]
  if (pinned && pinned !== 'neural-device') {
    return [pinned, ...chain.filter((m) => m !== pinned)]
  }
  return chain
}

export function pickTutorVoice(language?: string, model?: string): string {
  const lang = (language || 'en').toLowerCase()
  if (model?.includes('voxtral')) {
    return lang.startsWith('fr') ? 'fr_marie_neutral' : 'en_paul_neutral'
  }
  if (model?.includes('mai-voice')) {
    return lang.startsWith('fr') ? 'fr-FR-Denise:MAI-Voice-2' : 'en-US-Harper:MAI-Voice-2'
  }
  return lang.startsWith('fr') ? 'ara' : 'eve'
}

export async function synthesizeSpeech(args: SpeechArgs): Promise<SpeechResult> {
  const text = args.text.replace(/\s+/g, ' ').trim().slice(0, 1200)
  if (!text) throw new Error('Nothing to speak')
  const keys = getSkulMateApiKeys()
  const models = args.model ? [args.model, ...ttsModelChain().filter((m) => m !== args.model)] : ttsModelChain()
  let lastError: unknown
  for (const key of keys) {
    for (const model of models) {
      try {
        return await speakWith(key, {
          ...args,
          text,
          model,
          voice: args.voice || pickTutorVoice(args.language, model),
        })
      } catch (error) {
        lastError = error
      }
    }
  }
  throw lastError || new Error('OpenRouter speech unavailable')
}

async function speakWith(
  apiKey: string,
  args: SpeechArgs & { model: string; voice: string; text: string }
): Promise<SpeechResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(OPENROUTER_SPEECH, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://prepskul.com',
        'X-Title': 'SkulMate tutor',
      },
      body: JSON.stringify({
        model: args.model,
        input: args.text,
        voice: args.voice,
        response_format: 'mp3',
        speed: 1,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter speech ${response.status}: ${err.slice(0, 220)}`)
    }
    const audio = Buffer.from(await response.arrayBuffer())
    if (!audio.length) throw new Error('OpenRouter speech returned empty audio')
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    return { audio, contentType, model: args.model }
  } finally {
    clearTimeout(timer)
  }
}
