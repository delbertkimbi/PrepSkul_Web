export interface UsageLike {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface GameCostEstimate {
  estimatedCostUsd: number
  estimatedCredits: number
  breakdown: {
    ocrUsd: number
    entitiesUsd: number
    generationUsd: number
    safetyMarginUsd: number
  }
}

type PricePer1K = { input: number; output: number }

const MODEL_PRICING_PER_1K: Record<string, PricePer1K> = {
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'mistralai/mistral-7b-instruct': { input: 0.00008, output: 0.00008 },
  'meta-llama/llama-3.2-3b-instruct': { input: 0.00004, output: 0.00004 },
  'google/gemini-flash-1.5-8b': { input: 0.00006, output: 0.0001 },
  'google/gemini-flash-1.5': { input: 0.00008, output: 0.00012 },
  'qwen/qwen-2.5-vl-7b-instruct': { input: 0.00012, output: 0.0002 },
  'google/gemini-1.5-pro': { input: 0.0006, output: 0.0012 },
  'anthropic/claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  'anthropic/claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
}

const DEFAULT_PRICING: PricePer1K = { input: 0.0002, output: 0.0008 }

export function estimateTokensFromChars(chars: number): number {
  // Rough planning estimate: ~4 chars/token for mixed English/French study text.
  return Math.max(1, Math.ceil(chars / 4))
}

export function estimateModelCostUsd(
  model: string,
  usage?: UsageLike,
  fallbackPromptTokens = 0,
  fallbackCompletionTokens = 0
): number {
  const pricing = MODEL_PRICING_PER_1K[model] ?? DEFAULT_PRICING
  const promptTokens = usage?.prompt_tokens ?? fallbackPromptTokens
  const completionTokens = usage?.completion_tokens ?? fallbackCompletionTokens
  const cost =
    (promptTokens / 1000) * pricing.input +
    (completionTokens / 1000) * pricing.output
  return Number(cost.toFixed(6))
}

export function estimateSkulmateGameCost(params: {
  sourceType: 'pdf' | 'image' | 'text' | 'unknown'
  textLengthChars: number
  itemsCount: number
  generationModel?: string
  generationUsage?: UsageLike
  ocrModelHint?: string
  ocrAttempts?: number
}): GameCostEstimate {
  const textTokens = estimateTokensFromChars(params.textLengthChars)
  const itemFactor = Math.max(1, Math.ceil(params.itemsCount / 8))

  const entitiesUsd = Number((textTokens / 1000 * 0.00025).toFixed(6))
  const generationUsd = params.generationModel
    ? estimateModelCostUsd(
        params.generationModel,
        params.generationUsage,
        textTokens + 900,
        800 + itemFactor * 250
      )
    : Number(((textTokens / 1000) * 0.0007 + itemFactor * 0.0002).toFixed(6))

  const ocrAttempts = Math.max(1, params.ocrAttempts ?? 1)
  const ocrModel = params.ocrModelHint ?? 'qwen/qwen-2.5-vl-7b-instruct'
  const ocrUsd =
    params.sourceType == 'image'
      ? Number(
          (
            estimateModelCostUsd(ocrModel, undefined, 1200 * ocrAttempts, 650) *
            1.15
          ).toFixed(6)
        )
      : 0

  // Keep a conservative margin for retries/fallbacks.
  const subtotal = ocrUsd + entitiesUsd + generationUsd
  const safetyMarginUsd = Number((subtotal * 0.25).toFixed(6))
  const estimatedCostUsd = Number((subtotal + safetyMarginUsd).toFixed(6))

  // Simple monetization unit: credits per generation.
  // 1 credit base + extras for expensive paths.
  const estimatedCredits = Math.max(
    1,
    1 +
      (params.sourceType == 'image' ? 1 : 0) +
      (params.textLengthChars > 12000 ? 1 : 0) +
      (params.itemsCount > 20 ? 1 : 0)
  )

  return {
    estimatedCostUsd,
    estimatedCredits,
    breakdown: {
      ocrUsd,
      entitiesUsd,
      generationUsd,
      safetyMarginUsd,
    },
  }
}

export function estimateBatchCost(params: {
  games: number
  avgCostUsdPerGame: number
  avgCreditsPerGame: number
}) {
  const games = Math.max(0, params.games)
  return {
    totalEstimatedCostUsd: Number((games * params.avgCostUsdPerGame).toFixed(4)),
    totalEstimatedCredits: Math.ceil(games * params.avgCreditsPerGame),
  }
}
