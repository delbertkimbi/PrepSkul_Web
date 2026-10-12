/**
 * Best local / on-device models per SkulMate task.
 * Used when SKULMATE_LOCAL_ENGINES=1 (Ollama + device STT/TTS).
 *
 * Embeddings stay on OpenRouter (1536-d, matches skulmate_chunks) unless
 * SKULMATE_LOCAL_EMBED=1 — nomic-embed-text is 768-d and needs a new column.
 */

import type { EngineKind, ModelConfig } from './registry'

export const LOCAL_ENGINE_CATALOG: Record<EngineKind, ModelConfig> = {
  policy: {
    id: 'policy.local',
    kind: 'policy',
    displayName: 'Local tutor (Qwen3.8 27B)',
    model: process.env.SKULMATE_LOCAL_POLICY_MODEL || 'ollama/qwen3.8:27b',
    costClass: 'cheap',
    timeoutMs: 40000,
  },
  verifier: {
    id: 'verifier.local',
    kind: 'verifier',
    displayName: 'Local verifier (Qwen3.5 9B)',
    model: process.env.SKULMATE_LOCAL_VERIFIER_MODEL || 'ollama/qwen3.5:9b',
    costClass: 'cheap',
    timeoutMs: 2500,
  },
  embed: {
    id: 'embed.local',
    kind: 'embed',
    displayName: 'Local embeddings (nomic-embed-text)',
    model: process.env.SKULMATE_LOCAL_EMBED_MODEL || 'ollama/nomic-embed-text',
    costClass: 'cheap',
    timeoutMs: 8000,
  },
  stt: {
    id: 'stt.local',
    kind: 'stt',
    displayName: 'On-device STT (Whisper large v3 turbo)',
    model: process.env.SKULMATE_LOCAL_STT_MODEL || 'whisper-large-v3-turbo',
    costClass: 'cheap',
    timeoutMs: 20000,
  },
  tts: {
    id: 'tts.local',
    kind: 'tts',
    displayName: 'On-device neural TTS',
    model: process.env.SKULMATE_TTS_MODEL || 'neural-device',
    costClass: 'cheap',
    timeoutMs: 8000,
  },
  surface: {
    id: 'surface.local',
    kind: 'surface',
    displayName: 'Local practice compiler (Qwen3.8 27B)',
    model: process.env.SKULMATE_LOCAL_SURFACE_MODEL || 'ollama/qwen3.8:27b',
    costClass: 'cheap',
    timeoutMs: 20000,
  },
}

export const LOCAL_TASK_NOTES = {
  tutor: 'ollama/qwen3.8:27b — dense, bilingual EN/FR, fits a 16GB laptop GPU. Fallback: qwen3.6:27b.',
  hardReasoning: 'Do not run Opus locally. Keep reteach/escalate on OpenRouter anthropic/claude-opus-5.',
  verifier: 'ollama/qwen3.5:9b — JSON judge in <2s on CPU. Smaller than the tutor so it cannot “agree” by parroting.',
  embed: 'nomic-embed-text or bge-m3 for offline ingest only. Production pgvector is 1536-d (text-embedding-3-small).',
  rerank: 'Optional GPU: qwen/qwen3-reranker-8b. Skip on mobile — HNSW top-6 is enough.',
  stt: 'Flutter: speech_to_text. Offline: whisper.cpp large-v3-turbo EN/FR. Cloud: Deepgram Nova-3 (noisy classrooms, code-switch).',
  tts: 'Cloud neural TTS via OpenRouter x-ai/grok-voice-tts-1.0 (eve/ara). Failover voxtral-mini-tts then mai-voice-2. Device voice if the key is down. Full duplex barge-in, not WebRTC turn-taking.',
} as const
