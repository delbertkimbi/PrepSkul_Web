/**
 * Per-prompt image bundle limits from skulmate_pricing.
 */

export type ImageBundleLimits = {
  maxImagesPerPromptFree: number
  maxImagesPerPromptPaid: number
}

const DEFAULTS: ImageBundleLimits = {
  maxImagesPerPromptFree: 3,
  maxImagesPerPromptPaid: 5,
}

export function resolveImageBundleLimit(
  limits: ImageBundleLimits,
  hasPaidCredits: boolean
): number {
  return hasPaidCredits
    ? limits.maxImagesPerPromptPaid
    : limits.maxImagesPerPromptFree
}

export function parseImageBundleLimits(row: Record<string, unknown> | null): ImageBundleLimits {
  if (!row) return { ...DEFAULTS }
  return {
    maxImagesPerPromptFree: Number(
      row.max_images_per_prompt_free ?? DEFAULTS.maxImagesPerPromptFree
    ),
    maxImagesPerPromptPaid: Number(
      row.max_images_per_prompt_paid ?? DEFAULTS.maxImagesPerPromptPaid
    ),
  }
}

export function assertImageBundleWithinLimit(
  count: number,
  limit: number
): { ok: true } | { ok: false; error: string; errorCode: 'IMAGE_BUNDLE_TOO_LARGE' } {
  if (count < 1) {
    return {
      ok: false,
      error: 'At least one image is required.',
      errorCode: 'IMAGE_BUNDLE_TOO_LARGE',
    }
  }
  if (count > limit) {
    return {
      ok: false,
      error: `You can add up to ${limit} photos per game. Remove extras or upgrade for a higher limit.`,
      errorCode: 'IMAGE_BUNDLE_TOO_LARGE',
    }
  }
  return { ok: true }
}
