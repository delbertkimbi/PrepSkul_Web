import {
  frameworkMatchesLearnerProfile,
  isExamTrackLearner,
  learnerContextLine,
  parentFrameworkLabel,
  profileFromParentLearnerRow,
  readinessDisclaimer,
  readinessTitle,
  type LearnerPathProfile,
} from '@/lib/skulmate/learner-path-context'
import { getFrameworkLabel } from '@/lib/skulmate/curriculum-labels'

describe('learner-path-context', () => {
  it('does not treat primary learner as exam track', () => {
    expect(
      isExamTrackLearner({
        classLevel: 'Class 4',
        examType: 'None',
      })
    ).toBe(false)
  })

  it('treats Form 5 GCE as exam track', () => {
    expect(
      isExamTrackLearner({
        classLevel: 'Form 5',
        examType: 'GCE O Level',
      })
    ).toBe(true)
  })

  it('hides WAEC label for non-exam learner', () => {
    const label = parentFrameworkLabel({
      frameworkId: 'waec',
      profile: { classLevel: 'Class 3' },
      locale: 'en',
      getFrameworkLabel,
    })
    expect(label).toBeNull()
  })

  it('shows GCE label when profile matches', () => {
    const label = parentFrameworkLabel({
      frameworkId: 'cm_gce_ol',
      profile: { classLevel: 'Form 5', examType: 'GCE O Level' },
      locale: 'en',
      getFrameworkLabel,
    })
    expect(label).toContain('GCE')
  })

  it('uses class level line instead of exam for general learners', () => {
    expect(
      learnerContextLine({ classLevel: 'Form 2' }, 'en')
    ).toBe('Level: Form 2')
  })

  it('uses learning progress title for non-exam learners', () => {
    expect(readinessTitle({ classLevel: 'Class 5' }, 'en')).toBe(
      'Learning progress'
    )
    expect(
      readinessTitle({ classLevel: 'Form 5', examType: 'GCE' }, 'en')
    ).toContain('Exam')
  })

  it('parses parent learner row', () => {
    const profile = profileFromParentLearnerRow({
      class_level: 'Form 4',
      exam_type: 'WAEC',
    })
    expect(frameworkMatchesLearnerProfile('waec', profile)).toBe(true)
  })
})

describe('parent-feedback-sources', () => {
  it('prefers tutor-primary tone when tutor exists and weak topics', async () => {
    const { resolveParentMessageTone } = await import(
      '@/lib/skulmate/parent-feedback-sources'
    )
    expect(
      resolveParentMessageTone({ hasActiveTutor: true, skulmateWeakTopics: 2 })
    ).toBe('tutor_primary')
  })
})
