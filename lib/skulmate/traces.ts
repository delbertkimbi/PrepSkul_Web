import { getServiceSupabaseAdmin } from './billing'

export async function recordTutorTrace(params: {
  userId?: string
  sessionId?: string
  compiledContext?: unknown
  toolCalls?: unknown
  surface?: unknown
  outcome?: unknown
}): Promise<void> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return
  try {
    await admin.from('skulmate_tutor_traces').insert({
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? null,
      compiled_context: params.compiledContext ?? null,
      tool_calls: params.toolCalls ?? null,
      surface: params.surface ?? null,
      outcome: params.outcome ?? null,
    })
  } catch (error) {
    console.warn('[skulMate traces] skip', error)
  }
}
