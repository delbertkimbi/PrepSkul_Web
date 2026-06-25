import {
  formatUnderstandResultAsStudyText,
  isLowConfidenceUnderstand,
  parseUnderstandJson,
} from '@/lib/skulmate/understand'

describe('understand', () => {
  const sampleParsed = {
    summary: 'Notes on cell structure and organelles.',
    topicLabel: 'Cell biology',
    concepts: ['nucleus', 'mitochondria', 'membrane'],
    perImageEvidence: [
      {
        imageIndex: 1,
        label: 'Textbook page',
        observations: ['Diagram of animal cell', 'Labels for nucleus'],
      },
    ],
    confidence: 0.82,
  }

  it('parseUnderstandJson parses fenced JSON', () => {
    const raw = '```json\n' + JSON.stringify(sampleParsed) + '\n```'
    const result = parseUnderstandJson(raw)
    expect(result.topicLabel).toBe('Cell biology')
    expect(result.concepts).toHaveLength(3)
    expect(result.confidence).toBe(0.82)
  })

  it('parseUnderstandJson normalizes percent confidence', () => {
    const result = parseUnderstandJson(
      JSON.stringify({ ...sampleParsed, confidence: 75 })
    )
    expect(result.confidence).toBe(0.75)
  })

  it('formatUnderstandResultAsStudyText includes topic and concepts', () => {
    const text = formatUnderstandResultAsStudyText(sampleParsed)
    expect(text).toContain('Topic: Cell biology')
    expect(text).toContain('nucleus')
    expect(text).toContain('[Textbook page]')
  })

  it('isLowConfidenceUnderstand below 0.6', () => {
    expect(isLowConfidenceUnderstand(0.59)).toBe(true)
    expect(isLowConfidenceUnderstand(0.6)).toBe(false)
  })
})
