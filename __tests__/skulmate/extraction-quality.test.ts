import {
  assessExtractionQuality,
  buildExtractionQualityPromptSection,
} from '@/lib/skulmate/extraction-quality'

describe('extraction-quality internal QA', () => {
  it('rates clean pasted notes as high confidence', () => {
    const text =
      'Electrolysis: cathode attracts cations, anode attracts anions. Molten lead bromide produces lead at cathode and bromine at anode. Aqueous solutions may discharge H+ or OH- at electrodes depending on reactivity.'
    const quality = assessExtractionQuality({
      extractedText: text,
      extractionMethod: 'manual-text',
      sourceType: 'text',
      entitiesExtracted: 4,
    })
    expect(quality.level).toBe('high')
    expect(quality.confidence).toBeGreaterThanOrEqual(0.8)
    expect(buildExtractionQualityPromptSection(quality)).toBe('')
  })

  it('flags visual fallback image extraction as low confidence', () => {
    const quality = assessExtractionQuality({
      extractedText: 'A diagram showing cell parts nucleus membrane',
      extractionMethod: 'openrouter-visual:original',
      extractionMeta: { mode: 'visual-fallback', variantsAttempted: 3 },
      sourceType: 'image',
      entityExtractionFailed: true,
    })
    expect(quality.flags).toContain('visual_fallback')
    expect(quality.level).toBe('low')
    const prompt = buildExtractionQualityPromptSection(quality)
    expect(prompt).toContain('Stay strictly faithful')
    expect(prompt).not.toContain('syllabus')
  })

  it('flags thin youtube transcripts without blocking', () => {
    const quality = assessExtractionQuality({
      extractedText: 'Welcome to this short intro video about algebra basics and variables.',
      extractionMethod: 'youtube-transcript',
      sourceType: 'youtube',
    })
    expect(quality.flags).toContain('youtube_transcript_thin')
    expect(['medium', 'low']).toContain(quality.level)
  })
})
