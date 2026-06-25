import {
  assertImageBundleWithinLimit,
  parseImageBundleLimits,
  resolveImageBundleLimit,
} from '@/lib/skulmate/image-bundle-limits'

describe('image-bundle-limits', () => {
  describe('parseImageBundleLimits', () => {
    it('uses defaults when row is null', () => {
      expect(parseImageBundleLimits(null)).toEqual({
        maxImagesPerPromptFree: 3,
        maxImagesPerPromptPaid: 5,
      })
    })

    it('reads values from pricing row', () => {
      expect(
        parseImageBundleLimits({
          max_images_per_prompt_free: 2,
          max_images_per_prompt_paid: 8,
        })
      ).toEqual({
        maxImagesPerPromptFree: 2,
        maxImagesPerPromptPaid: 8,
      })
    })
  })

  describe('resolveImageBundleLimit', () => {
    const limits = { maxImagesPerPromptFree: 3, maxImagesPerPromptPaid: 5 }

    it('returns free cap without paid credits', () => {
      expect(resolveImageBundleLimit(limits, false)).toBe(3)
    })

    it('returns paid cap with paid credits', () => {
      expect(resolveImageBundleLimit(limits, true)).toBe(5)
    })
  })

  describe('assertImageBundleWithinLimit', () => {
    it('accepts bundles within limit', () => {
      expect(assertImageBundleWithinLimit(2, 3)).toEqual({ ok: true })
    })

    it('rejects empty bundles', () => {
      const result = assertImageBundleWithinLimit(0, 3)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errorCode).toBe('IMAGE_BUNDLE_TOO_LARGE')
      }
    })

    it('rejects bundles over limit', () => {
      const result = assertImageBundleWithinLimit(4, 3)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errorCode).toBe('IMAGE_BUNDLE_TOO_LARGE')
        expect(result.error).toContain('3')
      }
    })
  })
})
