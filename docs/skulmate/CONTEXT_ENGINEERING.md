# SkulMate context engineering

PrepSkul tutors from **curriculum + region + learner memory + optional uploads**, not from a fine-tuned personality. Notes are optional excerpts, not a requirement.

## Models (OpenRouter, Sep 2026)

| Task | Slug | Why |
| --- | --- | --- |
| Default talk | `moonshotai/kimi-k3` | Fast bilingual focusing turns |
| Playable check / board JSON | `anthropic/claude-fable-5.1` | Tools + structured UI |
| Hard reteach / escalate | `openai/gpt-6-astra` | Flagship reasoning (math/science). Failover still includes Opus 5 |
| Failover | Kimi → Fable → Astra → Qwen Flash → Gemini Flash → Qwen Max → Opus 5 | `policyModelChain` |
| Verifier + fast practice JSON | `qwen/qwen3.8-flash` | Sub-2s judge |
| Heavy Qwen | `qwen/qwen3.8-max-0902` | If Flash drops JSON |
| Fast alt | `google/gemini-3.8-flash` | Backup Flash |
| Embeddings | `openai/text-embedding-3-small` | 1536-d, matches `skulmate_chunks` |
| Cloud STT | Deepgram **Nova-3** | Noisy classrooms, EN/FR code-switch |
| TTS | `x-ai/grok-voice-tts-1.0` then Voxtral then Mai | Cloud neural first. Device speechSynthesis if keys are down |
| Pictures | Flux when keyed, unique SVG always | Every turn gets a new picture |

Do **not** fine-tune the tutor. Region packs, harvest JSON, and the verifier change weekly. A fine-tune would bake US-grade defaults and go stale. We already route the strongest OpenRouter catalog models (`kimi-k3`, `claude-fable-5.1`, `gpt-6-astra`). Fine-tune later only a tiny funneling classifier from `skulmate_tutor_traces` if regex + Flash miss too many dumps.

See `SUBJECTS_AND_AGES.md` and `CURRICULUM_HARVEST_PROMPT.md`.

## Local (laptop / offline classroom)

| Task | Model |
| --- | --- |
| Tutor | `ollama/qwen3.8:27b` |
| Verifier | `ollama/qwen3.5:9b` |
| Embed (offline only) | `nomic-embed-text` / `bge-m3` — 768-d, **not** the production column |
| STT | whisper.cpp **large-v3-turbo**, or on-device `speech_to_text` |
| TTS | Neural device voice (then optional Piper/Kokoro) |
| Rerank (optional GPU) | `qwen3-reranker-8b` |

Set `SKULMATE_LOCAL_ENGINES=1`. Embeddings stay on OpenRouter unless `SKULMATE_LOCAL_EMBED=1` (would need a 768-d column).

## Packet the policy model sees (budget ~4500 tokens)

1. **Identity** — speaker is the student (learner or parent). Language, class, pace.
2. **Region (compact)** — Cameroon Francophone/Anglophone first. Exam names only as calibration. Never dump the whole pack.
3. **Learning state** — last checks, weak concepts, assistance ledger (`independentDue`).
4. **Thread** — last ~10 turns, truncated.
5. **Retrieved context** — curriculum corpus first (lexical), then optional pasted excerpts, then pgvector HNSW top-6 (`match_skulmate_chunks`). Keyword fallback if embed is down. Harvest JSON in `data/curriculum/harvest/` thickens the corpus.
6. **App graph** — only if a recap or live-tutor booking is relevant.
7. **Tool schema** — one move, one tool.

Trim order when over budget: retrieved chars → thread length → drop app graph. Never drop identity or the assistance ledger.

## RAG / Supabase

- Chunk ~900 chars, 120 overlap (`chunk.ts`).
- Store `vector(1536)` on `skulmate_chunks`.
- Query with `108_skulmate_retrieval.sql` HNSW + `match_skulmate_chunks`.
- Scope by `user_id` and `child_id` (null = this student, not a sibling).
- Threshold 0.18. Top 6, hard cap 12.
- No cross-user retrieval. No syllabus-only gate — uploaded source wins.

## Speed

- Verifier is Flash, 1.8s timeout; regex still blocks answer dumps if Flash is late.
- Default tutor is Kimi, not Opus. Opus only on reteach/escalate. If Kimi is down, `policyModelChain` walks Fable, Flash, Gemini, Max, then Opus.
- Each policy call has a timeout. Junk or prose is repaired with `extractJsonObject`. Empty turns fall back to a focusing rewrite.
- The agent may call `retrieve_notes` once if the first packet has nothing useful.
- SQL cosine, not “fetch 40 embeddings into Node”.
- Compact region (~150 tokens) instead of the full pedagogy essay.
- Cloud neural TTS for the spoken line; Deepgram Nova-3 for noisy rooms. The lesson call is always-on: no mic tap to start talking. Privacy mute lives on the listening orb.
- Skip a rerank pass unless traces show the wrong note in slot 1.
