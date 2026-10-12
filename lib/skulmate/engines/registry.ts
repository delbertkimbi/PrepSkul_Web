/**
 * Voicebox-style engine registry for SkulMate.
 * Each capability is an engine with a contract — swap implementations
 * without changing routes or the Flutter canvas.
 *
 * Cloud defaults are the Sep 2026 OpenRouter catalog (verified against
 * https://openrouter.ai/api/v1/models). Override any slug with SKULMATE_*_MODEL.
 */

import { LOCAL_ENGINE_CATALOG } from './local-catalog'

export type EngineKind =
  | 'policy'
  | 'verifier'
  | 'embed'
  | 'stt'
  | 'tts'
  | 'surface'

export type PedagogyRouteMove =
  | 'focus'
  | 'scaffold'
  | 'instruct'
  | 'check'
  | 'independent'
  | 'reteach'
  | 'escalate'

export type ModelConfig = {
  id: string
  kind: EngineKind
  displayName: string
  model: string
  costClass: 'cheap' | 'standard' | 'premium'
  timeoutMs: number
}

/**
 * Canonical OpenRouter slugs in use. Aliases like ~openai/gpt-astra-latest
 * exist; we pin versions so a silent alias bump cannot change tutoring.
 */
export const OPENROUTER_SLUGS = {
  kimiK3: 'moonshotai/kimi-k3',
  opus5: 'anthropic/claude-opus-5',
  fable51: 'anthropic/claude-fable-5.1',
  astra: 'openai/gpt-6-astra',
  qwenFlash: 'qwen/qwen3.8-flash',
  qwenMax: 'qwen/qwen3.8-max-0902',
  geminiFlash: 'google/gemini-3.8-flash',
  embed: 'openai/text-embedding-3-small',
  grokTts: 'x-ai/grok-voice-tts-1.0',
  voxtralTts: 'mistralai/voxtral-mini-tts-2603',
  maiTts: 'microsoft/mai-voice-2',
  flux: 'black-forest-labs/flux.2-klein-4b',
} as const

export const ENGINE_CATALOG: Record<EngineKind, ModelConfig> = {
  policy: {
    id: 'policy.default',
    kind: 'policy',
    displayName: 'Tutor policy (Kimi K3)',
    model: process.env.SKULMATE_POLICY_MODEL || OPENROUTER_SLUGS.kimiK3,
    costClass: 'standard',
    timeoutMs: 25000,
  },
  verifier: {
    id: 'verifier.default',
    kind: 'verifier',
    displayName: 'Turn verifier (Qwen3.8 Flash)',
    model: process.env.SKULMATE_VERIFIER_MODEL || OPENROUTER_SLUGS.qwenFlash,
    costClass: 'cheap',
    timeoutMs: 1800,
  },
  embed: {
    id: 'embed.default',
    kind: 'embed',
    displayName: 'Embeddings',
    model: process.env.SKULMATE_EMBED_MODEL || OPENROUTER_SLUGS.embed,
    costClass: 'cheap',
    timeoutMs: 15000,
  },
  stt: {
    id: 'stt.default',
    kind: 'stt',
    displayName: 'Speech-to-text (Deepgram Nova-3)',
    model: process.env.SKULMATE_STT_MODEL || 'nova-3',
    costClass: 'standard',
    timeoutMs: 20000,
  },
  tts: {
    id: 'tts.default',
    kind: 'tts',
    displayName: 'Cloud neural TTS (Grok Voice via OpenRouter)',
    model: process.env.SKULMATE_TTS_MODEL || OPENROUTER_SLUGS.grokTts,
    costClass: 'standard',
    timeoutMs: 20000,
  },
  surface: {
    id: 'surface.default',
    kind: 'surface',
    displayName: 'Practice compiler (Qwen3.8 Flash)',
    model: process.env.SKULMATE_SURFACE_MODEL || OPENROUTER_SLUGS.qwenFlash,
    costClass: 'cheap',
    timeoutMs: 12000,
  },
}

export function usingLocalEngines(): boolean {
  return process.env.SKULMATE_LOCAL_ENGINES === '1'
}

export function getEngineConfig(kind: EngineKind): ModelConfig {
  if (usingLocalEngines() && kind !== 'embed') {
    return LOCAL_ENGINE_CATALOG[kind]
  }
  if (usingLocalEngines() && kind === 'embed' && process.env.SKULMATE_LOCAL_EMBED === '1') {
    return LOCAL_ENGINE_CATALOG.embed
  }
  return ENGINE_CATALOG[kind]
}

/**
 * Route the teaching model by move.
 * - Default talk: Kimi K3 (fast, bilingual, cheap enough every turn)
 * - Check / independent / instruct: Fable 5.1 (JSON, tools, playable UI)
 * - Reteach / escalate: GPT-6-Astra (flagship reasoning, math/science)
 * SKULMATE_POLICY_MODEL still pins every move when set.
 */
export function selectPolicyModel(move?: PedagogyRouteMove | string): string {
  const pinned = process.env.SKULMATE_POLICY_MODEL
  if (pinned) return pinned
  if (usingLocalEngines()) return LOCAL_ENGINE_CATALOG.policy.model
  if (move === 'reteach' || move === 'escalate') return OPENROUTER_SLUGS.astra
  if (move === 'check' || move === 'independent' || move === 'instruct') {
    return OPENROUTER_SLUGS.fable51
  }
  return OPENROUTER_SLUGS.kimiK3
}

/**
 * Ordered failover. Astra is in the chain so hard turns actually reach it,
 * not only when someone sets an env pin.
 */
export function policyModelChain(move?: PedagogyRouteMove | string): string[] {
  if (usingLocalEngines()) {
    return [LOCAL_ENGINE_CATALOG.policy.model, LOCAL_ENGINE_CATALOG.verifier.model]
  }
  const primary = selectPolicyModel(move)
  const rest = [
    OPENROUTER_SLUGS.kimiK3,
    OPENROUTER_SLUGS.fable51,
    OPENROUTER_SLUGS.astra,
    OPENROUTER_SLUGS.qwenFlash,
    OPENROUTER_SLUGS.geminiFlash,
    OPENROUTER_SLUGS.qwenMax,
    OPENROUTER_SLUGS.opus5,
  ]
  return [primary, ...rest.filter((slug) => slug !== primary)]
}

/** Fast JSON / extraction / practice. Flash first, then Gemini, then Kimi. */
export function cheapModelChain(): string[] {
  if (usingLocalEngines()) {
    return [LOCAL_ENGINE_CATALOG.surface.model, LOCAL_ENGINE_CATALOG.verifier.model]
  }
  return [
    process.env.SKULMATE_SURFACE_MODEL || OPENROUTER_SLUGS.qwenFlash,
    OPENROUTER_SLUGS.geminiFlash,
    OPENROUTER_SLUGS.kimiK3,
  ]
}

/** Story / mystery / escape-room generation. */
export function creativeModelChain(): string[] {
  if (usingLocalEngines()) {
    return [LOCAL_ENGINE_CATALOG.policy.model]
  }
  return [
    process.env.SKULMATE_POLICY_MODEL || OPENROUTER_SLUGS.fable51,
    OPENROUTER_SLUGS.kimiK3,
    OPENROUTER_SLUGS.astra,
    OPENROUTER_SLUGS.qwenMax,
  ]
}
