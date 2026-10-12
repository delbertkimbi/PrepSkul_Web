import { NextRequest } from 'next/server'
import { isAllowedOrigin, jsonWithCors } from './http'
export class ApiInputError extends Error { constructor(message: string, public status = 400) { super(message) } }
export function publicErrorMessage(error: unknown) {
  if (error instanceof ApiInputError) return error.message
  if (error instanceof Error && /not found/i.test(error.message)) return 'Requested learning record not found'
  return 'This request could not be completed. Please try again.'
}
/** Bound streamed bodies even if Content-Length is absent or false. */
export function guardApi(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      if (!isAllowedOrigin(request.headers.get('origin'))) throw new ApiInputError('Origin not allowed', 403)
      if (request.method === 'POST') {
        if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiInputError('JSON body required', 415)
        const max = 64 * 1024
        if (Number(request.headers.get('content-length')) > max) throw new ApiInputError('Request too large', 413)
        const reader = request.body?.getReader()
        let size = 0; const chunks: Uint8Array[] = []
        if (reader) while (true) {
          const {value, done} = await reader.read(); if (done) break
          size += value.byteLength
          if (size > max) { await reader.cancel(); throw new ApiInputError('Request too large', 413) }
          chunks.push(value)
        }
        let body: Record<string, unknown>
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new ApiInputError('Invalid JSON') }
        if (!body || Array.isArray(body) || typeof body !== 'object') throw new ApiInputError('JSON object required')
        for (const key of ['userId','childId','sessionId','turnId']) {
          const v = body[key]
          if (v != null && !(key === 'sessionId' && v === 'demo' && body.demo === true) &&
              (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))) throw new ApiInputError(`Invalid ${key}`)
        }
        for (const key of ['text','message','notes','title','language','conceptId','surfaceType','voice','prompt']) {
          if (body[key] != null && typeof body[key] !== 'string') throw new ApiInputError(`Invalid ${key}`)
        }
        request = new NextRequest(request.url, {method: 'POST', headers: request.headers, body: JSON.stringify(body)})
      }
      return await handler(request)
    } catch (error) {
      const status = error instanceof ApiInputError ? error.status : error instanceof Error && /not found/i.test(error.message) ? 404 : 503
      return jsonWithCors(request, {error: publicErrorMessage(error)}, status)
    }
  }
}
