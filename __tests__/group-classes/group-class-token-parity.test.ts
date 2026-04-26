import { getUserRoleInSession, validateSessionAccess } from '@/lib/services/agora/session-service'

type Row = Record<string, any>

function createMockClient(data: {
  individualSession?: Row | null
  participantRow?: Row | null
}) {
  return {
    from(table: string) {
      const state: { table: string; eqs: Record<string, any> } = {
        table,
        eqs: {},
      }

      const builder = {
        select: () => builder,
        eq: (field: string, value: any) => {
          state.eqs[field] = value
          return builder
        },
        or: () => builder,
        maybeSingle: async () => {
          const sessionId = state.eqs.id
          const userId = state.eqs.user_id

          if (state.table === 'individual_sessions') {
            if (
              data.individualSession &&
              (!sessionId || data.individualSession.id === sessionId)
            ) {
              return { data: data.individualSession, error: null }
            }
            return { data: null, error: null }
          }

          if (state.table === 'session_participants') {
            if (
              data.participantRow &&
              (!userId || data.participantRow.user_id === userId)
            ) {
              return { data: data.participantRow, error: null }
            }
            return { data: null, error: null }
          }

          return { data: null, error: null }
        },
      }

      return builder
    },
  }
}

describe('Group class token auth parity', () => {
  it('allows token access for paid group learner enrolled via session_participants', async () => {
    const client = createMockClient({
      individualSession: {
        id: 'group-session-1',
        tutor_id: 'tutor-1',
        learner_id: null,
        parent_id: null,
        status: 'scheduled',
      },
      participantRow: {
        user_id: 'learner-42',
        role: 'learner',
        individual_session_id: 'group-session-1',
      },
    })

    const hasAccess = await validateSessionAccess(
      'group-session-1',
      'learner-42',
      client as any,
    )
    expect(hasAccess).toBe(true)
  })

  it('maps group learner role to learner for Agora token role assignment', async () => {
    const client = createMockClient({
      individualSession: {
        id: 'group-session-2',
        tutor_id: 'tutor-1',
        learner_id: null,
        parent_id: null,
      },
      participantRow: {
        user_id: 'learner-99',
        role: 'learner',
        individual_session_id: 'group-session-2',
      },
    })

    const role = await getUserRoleInSession(
      'group-session-2',
      'learner-99',
      client as any,
    )
    expect(role).toBe('learner')
  })

  it('denies token access when a user is not in group session participants', async () => {
    const client = createMockClient({
      individualSession: {
        id: 'group-session-3',
        tutor_id: 'tutor-1',
        learner_id: null,
        parent_id: null,
      },
      participantRow: null,
    })

    const hasAccess = await validateSessionAccess(
      'group-session-3',
      'random-user',
      client as any,
    )
    expect(hasAccess).toBe(false)
  })
})

