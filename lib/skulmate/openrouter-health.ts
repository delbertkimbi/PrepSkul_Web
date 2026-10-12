import { hasSkulMateApiKeys } from './auth'
import { ENGINE_CATALOG, OPENROUTER_SLUGS } from './engines/registry'
import { ttsModelChain } from './engines/openrouter-tts'

/**
 * Runtime snapshot of the SkulMate OpenRouter backend.
 * Never returns key material. Chat, TTS, embeddings, and Flux all go through
 * https://openrouter.ai/api/v1 when SKULMATE_OPENROUTER_API_KEY or
 * OPENROUTER_API_KEY is set. Without a key, tutor turns use the local demo.
 */
export function getOpenRouterHealth() {
  const configured = hasSkulMateApiKeys()
  return {
    ok: true,
    product: 'PrepSkul',
    experience: 'SkulMate',
    provider: 'openrouter',
    configured,
    demoFallback: !configured,
    baseUrl: 'https://openrouter.ai/api/v1',
    endpoints: {
      chat: '/chat/completions',
      speech: '/audio/speech',
    },
    models: {
      policy: ENGINE_CATALOG.policy.model,
      verifier: ENGINE_CATALOG.verifier.model,
      embed: ENGINE_CATALOG.embed.model,
      tts: ENGINE_CATALOG.tts.model,
      ttsFailover: ttsModelChain(),
      images: OPENROUTER_SLUGS.flux,
      talk: OPENROUTER_SLUGS.kimiK3,
      check: OPENROUTER_SLUGS.fable51,
      reteach: OPENROUTER_SLUGS.astra,
    },
    keys: {
      skulmate: Boolean(process.env.SKULMATE_OPENROUTER_API_KEY?.trim()),
      fallback: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    },
  }
}
