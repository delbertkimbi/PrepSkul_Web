/**
 * Held-out tutor evals: next-move quality, not "did JSON parse".
 * Protocol: focusing → scaffold → independent check. Never dump answers.
 */

import type { PedagogyMove } from '../pedagogy'
import { recommendPedagogyMove } from '../pedagogy'

export type TutorEvalCase = {
  id: string
  studentMessage: string
  lastOutcomes: Array<{ concept_id: string; correct: boolean }>
  independentDue?: boolean
  expectMove: PedagogyMove
  mustMention?: string
}

export const TUTOR_EVAL_FIXTURES: TutorEvalCase[] = [
  {
    id: 'new-notes-focus-first',
    studentMessage: 'Here are my photosynthesis notes. The light reaction is confusing.',
    lastOutcomes: [],
    expectMove: 'focus',
    mustMention: 'light',
  },
  {
    id: 'miss-then-scaffold',
    studentMessage: 'I still don’t get why water splits.',
    lastOutcomes: [{ concept_id: 'photosynthesis-light', correct: false }],
    expectMove: 'scaffold',
  },
  {
    id: 'three-misses-escalate',
    studentMessage: 'I keep getting this wrong.',
    lastOutcomes: [
      { concept_id: 'photosynthesis-light', correct: false },
      { concept_id: 'photosynthesis-light', correct: false },
      { concept_id: 'photosynthesis-light', correct: false },
    ],
    expectMove: 'escalate',
  },
  {
    id: 'helped-then-independent',
    studentMessage: 'Okay I think I get it.',
    lastOutcomes: [{ concept_id: 'photosynthesis-light', correct: true }],
    independentDue: true,
    expectMove: 'independent',
  },
  {
    id: 'correct-advance',
    studentMessage: 'Ready for the next bit.',
    lastOutcomes: [{ concept_id: 'photosynthesis-light', correct: true }],
    expectMove: 'check',
  },
]

export function recommendMoveFromEvidence(
  lastOutcomes: Array<{ concept_id?: string; correct: boolean }>,
  independentDue = false
): PedagogyMove {
  return recommendPedagogyMove({ lastOutcomes, independentDue })
}
