# What Mate can teach, and for whom

Honest product map. Not a marketing promise.

## Age and class

Mate is not a kids-only toy and not a university-only coach.

| World | Classes | Rough ages |
| --- | --- | --- |
| Cameroon Francophone | SIL → Terminale, then University | about 5 to 22+ |
| Cameroon Anglophone | Class 1 → Upper Sixth, then University | about 5 to 22+ |
| Nigeria / Ghana / Kenya / ZA / FR / GB / US | matching primary → uni levels in `region-packs.ts` | same span |

Parents and learners are **both students**. A parent account is not a surveillance seat.

## Subjects Mate will attempt

Region packs (Cameroon first, then the rest):

- **Francophone:** Mathematics, French, English, Physics-Chemistry, SVT, History-Geography, Philosophy, Computer science, plus "Something else"
- **Anglophone / shared:** Mathematics, English, French, Physics, Chemistry, Biology, Geography, Literature, Economics, Computer science, plus "Something else"

The policy model is **not** gated to that list. "Something else" and off-script questions (photosynthesis during a maths onboard, coding, faith, business) still get a focusing turn. Human tutors cover the same range online (WebRTC) or onsite.

Built-in curriculum corpus today is a **starter**: linear equations, percent, photosynthesis, osmosis, Newton, atoms, Cameroon climate, independence, paragraph, French accord, demand, variables. Harvest packs (see `CURRICULUM_HARVEST_PROMPT.md`) fill the rest.

## Models (OpenRouter catalog, not a private fine-tune)

| Job | Model |
| --- | --- |
| Talk | `moonshotai/kimi-k3` |
| Playable check / JSON | `anthropic/claude-fable-5.1` |
| Hard reteach | `openai/gpt-6-astra` (Opus 5 failover) |
| Verifier | `qwen/qwen3.8-flash` |
| Embeddings | `openai/text-embedding-3-small` |
| Pictures | Flux via OpenRouter when keyed, unique SVG always |
| Voice out | `grok-voice-tts-1.0` → Voxtral → Mai, device fallback |
| Voice in | Deepgram Nova-3 in noisy rooms, browser / on-device STT for the live call |

## RAG, vector DB, fine-tuning

| Layer | Status |
| --- | --- |
| Local curriculum corpus (lexical) | **Working.** No API key needed. |
| pgvector `skulmate_chunks` + HNSW `match_skulmate_chunks` | **Wired.** Fills when a learner uploads and OpenRouter embeddings + Supabase are up. |
| Learner memory (local + skill_map) | **Working** locally; cloud skill_map when session APIs succeed. |
| Fine-tuned tutor weights | **Not running.** We do not train a PrepSkul personality. We route the strongest catalog models and retrieve context. A tiny funneling classifier from traces is the only fine-tune that would help later. |

Do not tell the live tutor "you only teach Cameroon". Cameroon is the densest pack. Other packs calibrate names, exams, and examples.
