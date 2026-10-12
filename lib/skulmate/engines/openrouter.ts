import { getSkulMateApiKeys } from '../auth'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_call_id?: string
  tool_calls?: ToolCall[]
}

export type ToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export type ChatTool = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type ChatResult = {
  content: string
  model: string
  toolCalls: ToolCall[]
}

export type SkulMateChatArgs = {
  model: string
  messages: ChatMessage[]
  timeoutMs: number
  json?: boolean
  tools?: ChatTool[]
  temperature?: number
  maxTokens?: number
  reasoningEffort?: 'low' | 'medium' | 'high'
}

export async function skulmateChat(args: SkulMateChatArgs): Promise<ChatResult> {
  const keys = getSkulMateApiKeys()
  let lastError: unknown
  for (const key of keys) {
    try {
      return await chatWithKey(key, args)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('OpenRouter unavailable')
}

async function chatWithKey(apiKey: string, args: SkulMateChatArgs): Promise<ChatResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), args.timeoutMs)
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://prepskul.com',
        'X-Title': 'SkulMate tutor',
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        max_tokens: args.maxTokens ?? 900,
        temperature: args.temperature ?? 0.4,
        ...(args.json ? { response_format: { type: 'json_object' } } : {}),
        ...(args.tools?.length ? { tools: args.tools, tool_choice: 'auto' } : {}),
        ...(args.model.includes('gpt-6-astra')
          ? { reasoning: { effort: args.reasoningEffort || 'medium' } }
          : {}),
      }),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter ${response.status}: ${error.slice(0, 280)}`)
    }
    const payload = (await response.json()) as {
      model?: string
      choices?: Array<{
        message?: {
          content?: string | null
          tool_calls?: ToolCall[]
        }
      }>
    }
    const message = payload.choices?.[0]?.message
    return {
      content: String(message?.content || ''),
      model: payload.model || args.model,
      toolCalls: Array.isArray(message?.tool_calls) ? message.tool_calls : [],
    }
  } finally {
    clearTimeout(timer)
  }
}
