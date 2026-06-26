import {
  buildPuzzleSubjectAddendum,
  buildPuzzleUserPromptSection,
  detectPuzzleSubjectProfile,
  hasProcessSequenceSignals,
  PUZZLE_JSON_EXAMPLE,
} from '@/lib/skulmate/puzzle-prompts'

describe('puzzle-prompts', () => {
  describe('detectPuzzleSubjectProfile', () => {
    it('detects biology from photosynthesis notes', () => {
      const text =
        'Photosynthesis occurs in chloroplasts. The Calvin cycle happens in the stroma while light reactions use the thylakoid membrane.'
      expect(detectPuzzleSubjectProfile(text)).toBe('biology')
    })

    it('detects cs from SOA notes', () => {
      const text =
        'Service-oriented architecture uses loosely coupled services exposed via HTTP APIs. Reusability is a core SOA principle.'
      expect(detectPuzzleSubjectProfile(text)).toBe('cs')
    })

    it('detects history from WWI notes', () => {
      const text =
        'The Treaty of Versailles ended World War I. Primary sources describe the causes of the war and colonial tensions.'
      expect(detectPuzzleSubjectProfile(text)).toBe('history')
    })

    it('detects maths from formula notes', () => {
      const text = "Ohm's law: V = IR. Use this equation when voltage and resistance are known."
      expect(detectPuzzleSubjectProfile(text)).toBe('maths')
    })

    it('falls back to general for ambiguous short text', () => {
      expect(detectPuzzleSubjectProfile('hello world')).toBe('general')
    })

    it('uses topic hint when notes are sparse', () => {
      expect(detectPuzzleSubjectProfile('', 'photosynthesis and chloroplasts')).toBe(
        'biology',
      )
    })
  })

  describe('buildPuzzleSubjectAddendum', () => {
    it('includes topic in biology template', () => {
      const addendum = buildPuzzleSubjectAddendum('biology', 'Photosynthesis')
      expect(addendum).toContain('Photosynthesis')
      expect(addendum).toContain('GCE')
      expect(addendum).toContain('needsImage: false')
    })

    it('returns empty for general', () => {
      expect(buildPuzzleSubjectAddendum('general')).toBe('')
    })
  })

  describe('buildPuzzleUserPromptSection', () => {
    it('includes master arc, subject addendum, and needsImage false', () => {
      const section = buildPuzzleUserPromptSection({
        topic: 'SOA',
        text: 'Service-oriented architecture and HTTP APIs with reusable microservices.',
      })
      expect(section).toContain('TEXT-FIRST')
      expect(section).toContain('LESSON ARC')
      expect(section).toContain('Detected subject profile: cs')
      expect(section).toContain('SUBJECT TEMPLATE (CS')
      expect(section).toContain('needsImage: false')
      expect(section).toContain('pick_one')
      expect(section).toContain('hotspot_drop')
      expect(section).toContain('order_check')
    })

    it('embeds JSON example with 6 steps', () => {
      const section = buildPuzzleUserPromptSection({
        text: 'Some notes about learning.',
      })
      expect(section).toContain('"puzzleSteps"')
      expect(PUZZLE_JSON_EXAMPLE.puzzleSteps).toHaveLength(6)
    })
  })

  describe('hasProcessSequenceSignals', () => {
    it('detects numbered steps', () => {
      expect(
        hasProcessSequenceSignals('Step 1: gather data\nStep 2: analyze\nFinally: report'),
      ).toBe(true)
    })

    it('returns false for plain definitions', () => {
      expect(hasProcessSequenceSignals('Mitochondria produce ATP.')).toBe(false)
    })
  })
})
