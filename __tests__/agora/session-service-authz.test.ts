import { getUserRoleInSession, validateSessionAccess } from '@/lib/services/agora/session-service'

type Row = Record<string, any>

function createMockClient(data: {
  individualSession?: Row | null
  trialSession?: Row | null
  participantRow?: Row | null
  recurringSession?: Row | null
}) {
  return {
    from(table: string) {
      const state: {
        table: string
        eqs: Record<string, any>
      } = { table, eqs: {} }

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
            if (data.individualSession && (!sessionId || data.individualSession.id === sessionId)) {
              return { data: data.individualSession, error: null }
            }
            return { data: null, error: null }
          }

          if (state.table === 'trial_sessions') {
            if (data.trialSession && (!sessionId || data.trialSession.id === sessionId)) {
              return { data: data.trialSession, error: null }
            }
            return { data: null, error: null }
          }

          if (state.table === 'session_participants') {
            if (data.participantRow && (!userId || data.participantRow.user_id === userId)) {
              return { data: data.participantRow, error: null }
            }
            return { data: null, error: null }
          }

          if (state.table === 'recurring_sessions') {
            if (data.recurringSession && (!sessionId || data.recurringSession.id === sessionId)) {
              return { data: data.recurringSession, error: null }
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

describe('Agora session auth parity', () => {
  it('allows legacy individual-session tutor access', async () => {
    const client = createMockClient({
      individualSession: {
        id: 's1',
        tutor_id: 'u1',
        learner_id: 'u2',
        parent_id: null,
        status: 'scheduled',
      },
    })

    const allowed = await validateSessionAccess('s1', 'u1', client)
    expect(allowed).toBe(true)
  })

  it('allows access via session_participants when user is not a legacy field participant', async () => {
    const client = createMockClient({
      individualSession: {
        id: 's1',
        tutor_id: 'u1',
        learner_id: 'u2',
        parent_id: null,
        status: 'scheduled',
      },
      participantRow: {
        user_id: 'u3',
        role: 'learner',
        individual_session_id: 's1',
      },
    })

    const allowed = await validateSessionAccess('s1', 'u3', client)
    expect(allowed).toBe(true)
  })

  it('supports trial-session participant parity through session_participants', async () => {
    const client = createMockClient({
      trialSession: {
        id: 't1',
        tutor_id: 'u10',
        learner_id: 'u11',
        parent_id: null,
        status: 'pending',
      },
      participantRow: {
        user_id: 'u12',
        role: 'learner',
        trial_session_id: 't1',
      },
    })

    const allowed = await validateSessionAccess('t1', 'u12', client)
    expect(allowed).toBe(true)
  })

  it('returns learner role for parent_observer participant mapping', async () => {
    const client = createMockClient({
      individualSession: {
        id: 's2',
        tutor_id: 'u1',
        learner_id: 'u2',
        parent_id: null,
      },
      participantRow: {
        user_id: 'u4',
        role: 'parent_observer',
        individual_session_id: 's2',
      },
    })

    const role = await getUserRoleInSession('s2', 'u4', client)
    expect(role).toBe('learner')
  })

  it('denies access when user is neither legacy nor session_participants member', async () => {
    const client = createMockClient({
      individualSession: {
        id: 's3',
        tutor_id: 'u1',
        learner_id: 'u2',
        parent_id: null,
        status: 'scheduled',
      },
      participantRow: null,
    })

    const allowed = await validateSessionAccess('s3', 'u9', client)
    expect(allowed).toBe(false)
  })
})

