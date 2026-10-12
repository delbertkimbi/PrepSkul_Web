import { ApiInputError } from './api-input'
/** Only the authenticated user's documents in this project's storage may be fetched. */
export function assertOwnedUpload(raw: string, userId: string): URL {
  let url: URL; let project: URL
  try { url = new URL(raw); project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '') } catch { throw new ApiInputError('Invalid upload URL') }
  let segments: string[]
  try { segments = decodeURIComponent(url.pathname).split('/') } catch { throw new ApiInputError('Invalid upload URL') }
  if (url.protocol !== 'https:' || url.origin !== project.origin || url.username || url.password || url.hash ||
      segments[1] !== 'storage' || segments[2] !== 'v1' || segments[3] !== 'object' ||
      !['sign','authenticated'].includes(segments[4]) || segments[5] !== 'documents' || segments[6] !== userId || segments.length < 8 ||
      segments.slice(7).some(x => !x || x === '.' || x === '..' || x.includes('\\'))) {
    throw new ApiInputError('Upload does not belong to this account', 403)
  }
  return url
}
export async function downloadOwnedUpload(raw: string, userId: string): Promise<Buffer> {
  const url = assertOwnedUpload(raw,userId)
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) })
  if (!response.ok || !response.body) throw new ApiInputError('Could not read upload', 422)
  const max = 10 * 1024 * 1024
  if (Number(response.headers.get('content-length')) > max) throw new ApiInputError('Upload exceeds 10 MB',413)
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const {value,done} = await reader.read(); if (done) break
    size += value.byteLength
    if (size > max) { await reader.cancel(); throw new ApiInputError('Upload exceeds 10 MB',413) }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}
