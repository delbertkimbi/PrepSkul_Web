/**
 * Robust tutor agent: failover models, timeouts, JSON repair, optional tools.
 * The policy model teaches. This loop is how we get a usable turn when a
 * provider is slow, returns prose, or asks to look at notes again.
 */

import { hasSkulMateApiKeys } from '../auth'
import { PEDAGOGY_SYSTEM, type AssistanceLevel, type PedagogyMove } from '../pedagogy'
import { boardFromFocusPrompt, validateWhiteboard, type WhiteboardPayload } from '../whiteboard-contract'
import { getEngineConfig, policyModelChain } from './registry'
import { extractJsonObject } from './json'
import { skulmateChat, type ChatMessage, type ChatTool, type ChatResult } from './openrouter'
import { planLocalTurn } from './local-tutor'
import type { PracticeSurface } from '../surface-contract'

const PEDAGOGY_MOVES: PedagogyMove[] = [
  'focus',
  'scaffold',
  'instruct',
  'check',
  'independent',
  'reteach',
  'escalate',
]

export type PolicyTool = {
  name: 'spawn_surface' | 'escalate_tutor' | 'draw_board' | 'retrieve_notes' | 'retrieve_context' | 'show_image'
  conceptId?: string
  surfaceType?: string
  query?: string
} | null

export type PolicyJson = {
  message: string
  move: PedagogyMove
  speak?: boolean
  assistance?: AssistanceLevel
  misconception?: string | null
  conceptId?: string | null
  board?: WhiteboardPayload | null
  tool?: PolicyTool
  model?: string
  attempts?: number
  demo?: boolean
  surface?: PracticeSurface | null
  displayHint?: string | null
  imagePrompt?: string | null
}

export type AgentChat = (args: {
  model: string
  messages: ChatMessage[]
  timeoutMs: number
  tools?: ChatTool[]
}) => Promise<ChatResult>

export type AgentTools = {
  retrieveNotes?: (query: string) => Promise<string>
  retrieveContext?: (query: string) => Promise<string>
}

const TUTOR_TOOLS: ChatTool[] = [
  {
    type: 'function',
    function: {
      name: 'retrieve_context',
      description:
        'Search curriculum and optional uploads. Use when retrieved context is thin or off-topic. Do not ask the student for notes.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Short search query in the student language' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'retrieve_notes',
      description: 'Alias of retrieve_context for older clients.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
]

export async function runTutorAgent(input: {
  compiled: string
  userMessage: string
  suggestedMove: PedagogyMove
  chat?: AgentChat
  tools?: AgentTools
  language?: string
  notes?: string
  recentTurns?: Array<{ role: string; text?: string | null }>
  subjectId?: string | null
  memory?: import('../learner-memory').LearnerMemory | null
}): Promise<PolicyJson> {
  const local = (): PolicyJson =>
    planLocalTurn({
      userMessage: input.userMessage,
      suggestedMove: input.suggestedMove,
      language: input.language,
      notes: input.notes,
      recentTurns: input.recentTurns,
      subjectId: input.subjectId,
      memory: input.memory,
    })

  if (!input.chat && !hasSkulMateApiKeys()) {
    return local()
  }

  const chat = input.chat || defaultChat
  const models = policyModelChain(input.suggestedMove)
  const timeoutMs = getEngineConfig('policy').timeoutMs
  const system = `${PEDAGOGY_SYSTEM}\n\nIf context is thin, call retrieve_context once, then answer as JSON. Do not ask for notes.`
  let attempts = 0

  for (const model of models) {
    attempts += 1
    try {
      const parsed = await runOneModel({
        model,
        timeoutMs: model.includes('astra') ? Math.max(timeoutMs, 40000) : timeoutMs,
        compiled: input.compiled,
        userMessage: input.userMessage,
        suggestedMove: input.suggestedMove,
        system,
        chat,
        tools: input.tools,
      })
      if (parsed) {
        return { ...parsed, model, attempts }
      }
    } catch {
      continue
    }
  }

  return { ...local(), attempts }
}

async function runOneModel(args: {
  model: string
  timeoutMs: number
  compiled: string
  userMessage: string
  suggestedMove: PedagogyMove
  system: string
  chat: AgentChat
  tools?: AgentTools
}): Promise<PolicyJson | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: args.system },
    {
      role: 'user',
      content: `${args.compiled}\n\nSUGGESTED MOVE: ${args.suggestedMove}\nSTUDENT SAID:\n${args.userMessage}`,
    },
  ]

  for (let step = 0; step < 3; step++) {
    const result = await args.chat({
      model: args.model,
      messages,
      timeoutMs: args.timeoutMs,
      tools: args.tools?.retrieveNotes || args.tools?.retrieveContext ? TUTOR_TOOLS : undefined,
    })

    if (result.toolCalls.length && (args.tools?.retrieveNotes || args.tools?.retrieveContext)) {
      messages.push({
        role: 'assistant',
        content: result.content || '',
        tool_calls: result.toolCalls,
      })
      for (const call of result.toolCalls) {
        const name = call.function?.name
        const payload = extractJsonObject(call.function?.arguments || '') || {}
        let body = 'ok'
        const lookup = args.tools.retrieveContext || args.tools.retrieveNotes
        if ((name === 'retrieve_notes' || name === 'retrieve_context') && lookup) {
          body = await lookup(String(payload.query || args.userMessage))
        } else {
          body = `unknown tool ${name}`
        }
        messages.push({
          role: 'tool',
          name,
          tool_call_id: call.id,
          content: body.slice(0, 2400),
        })
      }
      continue
    }

    return parsePolicy(result.content, args.suggestedMove)
  }
  return null
}

export function parsePolicy(raw: string, fallbackMove: PedagogyMove): PolicyJson | null {
  const parsed = extractJsonObject(raw)
  if (!parsed) return null
  const message = typeof parsed.message === 'string' ? parsed.message.trim() : ''
  if (!message) return null
  const tool = normalizeTool(parsed.tool)
  return {
    message,
    move: normalizeMove(parsed.move, fallbackMove),
    speak: parsed.speak !== false,
    assistance:
      parsed.assistance === 'hint' || parsed.assistance === 'instruct'
        ? parsed.assistance
        : 'none',
    misconception: typeof parsed.misconception === 'string' ? parsed.misconception : null,
    conceptId:
      (typeof parsed.conceptId === 'string' && parsed.conceptId) ||
      tool?.conceptId ||
      null,
    board: validateWhiteboard(parsed.board),
    tool,
    displayHint: typeof parsed.displayHint === 'string' ? parsed.displayHint : null,
    imagePrompt: typeof parsed.imagePrompt === 'string' ? parsed.imagePrompt : null,
  }
}

function normalizeMove(raw: unknown, fallback: PedagogyMove): PedagogyMove {
  if (raw === 'teach') return 'focus'
  if (typeof raw === 'string' && PEDAGOGY_MOVES.includes(raw as PedagogyMove)) {
    return raw as PedagogyMove
  }
  return fallback
}

function normalizeTool(raw: unknown): PolicyTool {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const name = data.name
  if (
    name !== 'spawn_surface' &&
    name !== 'escalate_tutor' &&
    name !== 'draw_board' &&
    name !== 'retrieve_notes' &&
    name !== 'retrieve_context' &&
    name !== 'show_image'
  ) {
    return null
  }
  return {
    name,
    conceptId: typeof data.conceptId === 'string' ? data.conceptId : undefined,
    surfaceType: typeof data.surfaceType === 'string' ? data.surfaceType : undefined,
    query: typeof data.query === 'string' ? data.query : undefined,
  }
}

async function defaultChat(args: {
  model: string
  messages: ChatMessage[]
  timeoutMs: number
  tools?: ChatTool[]
}): Promise<ChatResult> {
  return skulmateChat({
    model: args.model,
    messages: args.messages,
    timeoutMs: args.timeoutMs,
    json: !args.tools?.length,
    tools: args.tools,
    temperature: 0.4,
    maxTokens: args.model.includes('astra') ? 1400 : 900,
    reasoningEffort: args.model.includes('astra') ? 'medium' : undefined,
  })
}
