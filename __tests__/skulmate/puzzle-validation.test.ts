import { PUZZLE_JSON_EXAMPLE } from '@/lib/skulmate/puzzle-prompts'
import {
  validateAndNormalizePuzzleGame,
  validateAndNormalizePuzzleItem,
} from '@/lib/skulmate/puzzle-validation'

describe('puzzle-validation', () => {
  const validItem = () =>
    structuredClone(PUZZLE_JSON_EXAMPLE) as Record<string, unknown>

  it('accepts valid 6-step puzzle', () => {
    const item = validItem()
    const result = validateAndNormalizePuzzleItem(item)
    expect(result.needsImage).toBe(false)
    expect((result.puzzleSteps as unknown[]).length).toBe(6)
    expect(result.puzzlePieces).toBeDefined()
  })

  it('builds puzzlePieces fallback when missing', () => {
    const item = validItem()
    delete item.puzzlePieces
    validateAndNormalizePuzzleItem(item)
    const pieces = item.puzzlePieces as Array<{ order: number }>
    expect(pieces.length).toBe(6)
    expect(pieces[0].order).toBe(0)
  })

  it('strips x,y,w,h from hotspots', () => {
    const item = validItem()
    const steps = item.puzzleSteps as Array<Record<string, unknown>>
    const hotspotStep = steps.find((s) => s.type === 'hotspot_drop')!
    const hotspots = hotspotStep.hotspots as Array<Record<string, unknown>>
    hotspots[0].x = 0.2
    hotspots[0].y = 0.3
    validateAndNormalizePuzzleItem(item)
    expect(hotspots[0].x).toBeUndefined()
    expect(hotspots[0].y).toBeUndefined()
  })

  it('rejects fewer than 6 steps', () => {
    const item = validItem()
    const steps = item.puzzleSteps as unknown[]
    item.puzzleSteps = steps.slice(0, 3)
    expect(() => validateAndNormalizePuzzleItem(item)).toThrow(/6–8 steps/)
  })

  it('rejects banned prompt phrases', () => {
    const item = validItem()
    const steps = item.puzzleSteps as Array<Record<string, unknown>>
    steps[0].prompt = 'What happens first?'
    expect(() => validateAndNormalizePuzzleItem(item)).toThrow(/banned prompt/)
  })

  it('rejects mismatched hotspot accepts', () => {
    const item = validItem()
    const steps = item.puzzleSteps as Array<Record<string, unknown>>
    const hotspotStep = steps.find((s) => s.type === 'hotspot_drop')!
    const hotspots = hotspotStep.hotspots as Array<Record<string, unknown>>
    hotspots[0].accepts = 'nonexistent_label'
    expect(() => validateAndNormalizePuzzleItem(item)).toThrow(/unknown dragLabel/)
  })

  it('rejects pick_one without exactly one correct', () => {
    const item = validItem()
    const steps = item.puzzleSteps as Array<Record<string, unknown>>
    const pickStep = steps.find((s) => s.type === 'pick_one')!
    pickStep.choices = [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: true },
    ]
    expect(() => validateAndNormalizePuzzleItem(item)).toThrow(/exactly one correct/)
  })

  it('rejects order_check with invalid orderSequence', () => {
    const item = validItem()
    const steps = item.puzzleSteps as Array<Record<string, unknown>>
    const orderStep = steps.find((s) => s.type === 'order_check')!
    orderStep.orderSequence = ['c1', 'c2', 'not_a_real_id']
    expect(() => validateAndNormalizePuzzleItem(item)).toThrow(/unknown id/)
  })

  it('validateAndNormalizePuzzleGame requires exactly one item', () => {
    expect(() => validateAndNormalizePuzzleGame([])).toThrow(/exactly one item/)
    expect(() => validateAndNormalizePuzzleGame([validItem(), validItem()])).toThrow(
      /exactly one item/,
    )
    const normalized = validateAndNormalizePuzzleGame([validItem()])
    expect(normalized.puzzleSteps).toBeDefined()
  })
})
