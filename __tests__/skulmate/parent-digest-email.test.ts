import { buildParentDigestEmailHtml } from '@/lib/skulmate/parent-digest-email'
import type { BuiltParentDigest } from '@/lib/skulmate/parent-digest-builder'

function sampleDigest(overrides: Partial<BuiltParentDigest> = {}): BuiltParentDigest {
  return {
    generatedAt: new Date().toISOString(),
    parentId: 'p1',
    childId: 'c1',
    childName: 'Amina',
    parentEmail: 'parent@example.com',
    learnerContextLine: 'Level: Form 2',
    isExamTrack: false,
    hasActiveTutor: false,
    activeTutorNames: [],
    sourcesIncluded: ['skulmate_games'],
    skulmate: {
      streakDays: 3,
      revisionMinutesLast7Days: 45,
      accuracyLast7Days: 72,
      readinessScore: 58,
      readinessLabel: 'On track',
      weakTopicLabels: ['Electrolysis'],
    },
    sessions: {
      upcomingCount: 1,
      recentCompletedCount: 1,
    },
    messageTone: 'revision_only',
    readinessTitle: 'Learning progress',
    readinessDisclaimer: 'Based on SkulMate practice only.',
    sessionHighlights: [
      {
        sessionId: 's1',
        tutorName: 'Jean',
        completedAt: new Date().toISOString(),
        summaryPreview: 'Worked through quadratic equations and homework review.',
        subjectHint: 'Mathematics',
      },
    ],
    upcomingSessions: [
      {
        sessionId: 's2',
        tutorName: 'Jean',
        scheduledAt: '2026-06-15 10:00',
        mode: 'online',
      },
    ],
    hasActivity: true,
    ...overrides,
  }
}

describe('parent-digest-email', () => {
  it('builds subject and HTML with child name', () => {
    const { subject, html } = buildParentDigestEmailHtml(sampleDigest())
    expect(subject).toContain('Amina')
    expect(html).toContain('Amina')
    expect(html).toContain('Electrolysis')
    expect(html).toContain('Mathematics')
  })

  it('mentions active tutor instead of find-a-tutor when tutor exists', () => {
    const { html } = buildParentDigestEmailHtml(
      sampleDigest({
        hasActiveTutor: true,
        activeTutorNames: ['Marie'],
        messageTone: 'tutor_primary',
      })
    )
    expect(html).toContain('Marie')
    expect(html).not.toContain('Find a tutor')
  })

  it('includes session highlight preview', () => {
    const { html } = buildParentDigestEmailHtml(sampleDigest())
    expect(html).toContain('quadratic equations')
    expect(html).toContain('2026-06-15')
  })
})
