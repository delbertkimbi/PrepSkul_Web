import {
  ENGINE_CATALOG,
  OPENROUTER_SLUGS,
  cheapModelChain,
  creativeModelChain,
  getEngineConfig,
  policyModelChain,
  selectPolicyModel,
} from '@/lib/skulmate/engines/registry'
import { LOCAL_ENGINE_CATALOG } from '@/lib/skulmate/engines/local-catalog'
import { compactPedagogyNotes, compileRegionContext, packById } from '@/lib/skulmate/region-packs'
import { compileTurnContext } from '@/lib/skulmate/compile-turn-context'
import { cosine, lexicalScore, rankChunksInProcess } from '@/lib/skulmate/retrieve'

describe('OpenRouter catalog (Sep 2026)', () => {
  it('pins Kimi K3, Fable 5.1, Opus 5, Qwen3.8 Flash, Astra', () => {
    expect(OPENROUTER_SLUGS.kimiK3).toBe('moonshotai/kimi-k3')
    expect(OPENROUTER_SLUGS.fable51).toBe('anthropic/claude-fable-5.1')
    expect(OPENROUTER_SLUGS.opus5).toBe('anthropic/claude-opus-5')
    expect(OPENROUTER_SLUGS.qwenFlash).toBe('qwen/qwen3.8-flash')
    expect(OPENROUTER_SLUGS.qwenMax).toBe('qwen/qwen3.8-max-0902')
    expect(OPENROUTER_SLUGS.astra).toBe('openai/gpt-6-astra')
    expect(OPENROUTER_SLUGS.geminiFlash).toBe('google/gemini-3.8-flash')
  })

  it('defaults the tutor to Kimi K3 and the verifier to Qwen Flash', () => {
    expect(ENGINE_CATALOG.policy.model).toBe(OPENROUTER_SLUGS.kimiK3)
    expect(ENGINE_CATALOG.verifier.model).toBe(OPENROUTER_SLUGS.qwenFlash)
    expect(ENGINE_CATALOG.surface.model).toBe(OPENROUTER_SLUGS.qwenFlash)
    expect(ENGINE_CATALOG.embed.model).toBe(OPENROUTER_SLUGS.embed)
    expect(ENGINE_CATALOG.stt.model).toBe('nova-3')
    expect(ENGINE_CATALOG.tts.model).toBe(OPENROUTER_SLUGS.grokTts)
    expect(OPENROUTER_SLUGS.voxtralTts).toBe('mistralai/voxtral-mini-tts-2603')
    expect(OPENROUTER_SLUGS.flux).toBe('black-forest-labs/flux.2-klein-4b')
    expect(getEngineConfig('verifier').timeoutMs).toBeLessThan(5000)
  })

  it('routes reteach to GPT-6-Astra and checks to Fable 5.1', () => {
    expect(selectPolicyModel('focus')).toBe(OPENROUTER_SLUGS.kimiK3)
    expect(selectPolicyModel('check')).toBe(OPENROUTER_SLUGS.fable51)
    expect(selectPolicyModel('independent')).toBe(OPENROUTER_SLUGS.fable51)
    expect(selectPolicyModel('reteach')).toBe(OPENROUTER_SLUGS.astra)
    expect(selectPolicyModel('escalate')).toBe(OPENROUTER_SLUGS.astra)
  })

  it('fails over policy models without repeating the primary', () => {
    const chain = policyModelChain('focus')
    expect(chain[0]).toBe(OPENROUTER_SLUGS.kimiK3)
    expect(chain).toContain(OPENROUTER_SLUGS.fable51)
    expect(chain).toContain(OPENROUTER_SLUGS.astra)
    expect(chain).toContain(OPENROUTER_SLUGS.qwenFlash)
    expect(new Set(chain).size).toBe(chain.length)
    expect(policyModelChain('reteach')[0]).toBe(OPENROUTER_SLUGS.astra)
  })

  it('uses Flash then Gemini then Kimi for cheap JSON work', () => {
    expect(cheapModelChain()[0]).toBe(OPENROUTER_SLUGS.qwenFlash)
    expect(cheapModelChain()).toContain(OPENROUTER_SLUGS.geminiFlash)
    expect(creativeModelChain()[0]).toBe(OPENROUTER_SLUGS.fable51)
    expect(creativeModelChain()).toContain(OPENROUTER_SLUGS.astra)
  })

  it('keeps a local catalog per task', () => {
    expect(LOCAL_ENGINE_CATALOG.policy.model).toContain('qwen3.8')
    expect(LOCAL_ENGINE_CATALOG.verifier.model).toContain('qwen3.5')
    expect(LOCAL_ENGINE_CATALOG.stt.model).toContain('whisper-large')
    expect(LOCAL_ENGINE_CATALOG.tts.model).toBe('neural-device')
    expect(LOCAL_ENGINE_CATALOG.embed.model).toContain('nomic-embed')
  })
})

describe('compact region context', () => {
  it('keeps Cameroon facts and drops colour commentary', () => {
    const full = packById('cm').pedagogyNotes
    const compact = compactPedagogyNotes(full)
    expect(compact).toContain('Cameroon')
    expect(compact).toMatch(/do not assume US grades/)
    expect(compact.length).toBeLessThan(full.length)
    expect(compact).not.toContain('motorbike-taxi')
  })

  it('injects a compact pack into the policy packet', () => {
    const compiled = compileTurnContext({
      accountRole: 'learner',
      learnerContext: {
        country: 'cm',
        city: 'douala',
        school_system: 'cm-anglophone',
        class_level: 'form5',
        exam: 'gce-o',
        language: 'en',
      },
    })
    expect(compiled.region).toContain('Cameroon')
    expect(compiled.region).toContain('Douala')
    expect(compiled.region).toContain('GCE')
    expect(compiled.region).not.toContain('motorbike-taxi')
    expect(compiled.tokenEstimate).toBeLessThan(5000)
  })

  it('still compiles the full pack when asked', () => {
    const notes = compileRegionContext({
      countryId: 'cm',
      cityId: 'yaounde',
      systemId: 'cm-francophone',
      levelId: '3eme',
      examId: 'bepc',
      locale: 'fr',
    })
    expect(notes).toContain('motorbike-taxi')
  })
})

describe('in-process retrieval ranking', () => {
  it('ranks the closer vector first', () => {
    const ranked = rankChunksInProcess(
      [
        {
          id: 'far',
          artifact_id: 'a',
          content: 'unrelated',
          embedding: [0, 1],
        },
        {
          id: 'near',
          artifact_id: 'a',
          content: 'photosynthesis in leaves',
          embedding: [1, 0],
        },
      ],
      [1, 0],
      'photosynthesis',
      2
    )
    expect(ranked[0].id).toBe('near')
    expect(ranked[0].similarity).toBeCloseTo(1)
  })

  it('falls back to lexical overlap without embeddings', () => {
    expect(lexicalScore('BEPC maths', 'Révision BEPC mathématiques')).toBeGreaterThan(0.3)
    expect(cosine([1, 0], [0, 1])).toBe(0)
  })
})
