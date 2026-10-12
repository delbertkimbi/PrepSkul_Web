import { NextRequest } from 'next/server'
import { guardApi } from '@/lib/skulmate/api-input'
import { isAllowedOrigin, skulmateCorsHeaders } from '@/lib/skulmate/http'
import { assertOwnedUpload, downloadOwnedUpload } from '@/lib/skulmate/owned-upload'

const user = '00000000-0000-0000-0000-000000000001'
const upload = `https://example.supabase.co/storage/v1/object/sign/documents/${user}/lesson.pdf?token=test`
const handler = jest.fn(async () => new Response('{}'))
const guarded = guardApi(handler)
function request(body: string, headers = {}) {
  return new NextRequest('https://www.prepskul.com/api/test', {method:'POST', headers:{'content-type':'application/json', ...headers}, body})
}
beforeEach(() => { handler.mockClear(); process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co' })
afterEach(() => jest.restoreAllMocks())
it('rejects lookalike and suffix origins without reflecting them', async () => {
  for (const origin of ['https://prepskul.com.evil.example', 'https://evilprepskul.com', 'null']) {
    expect(isAllowedOrigin(origin)).toBe(false)
    expect(skulmateCorsHeaders(origin)['Access-Control-Allow-Origin']).toBeUndefined()
    expect((await guarded(request('{}',{origin}))).status).toBe(403)
  }
  expect(handler).not.toHaveBeenCalled()
})
it('accepts the explicit site origin', async () => {
  expect((await guarded(request('{}',{origin:'https://www.prepskul.com'}))).status).toBe(200)
})
it.each(['null', '[]', 'oops', '{"userId":"someone"}', '{"message":{}}'])('rejects malformed input %s', async body => {
  expect((await guarded(request(body))).status).toBe(400)
  expect(handler).not.toHaveBeenCalled()
})
it('bounds actual bytes even without a content length', async () => {
  expect((await guarded(request(JSON.stringify({text:'x'.repeat(65536)})))).status).toBe(413)
  expect(handler).not.toHaveBeenCalled()
})
it('does not disclose internal errors', async () => {
  const fail = guardApi(async () => { throw new Error('private-key-value') })
  const response = await fail(request('{}'))
  expect(response.status).toBe(503)
  expect(await response.text()).not.toContain('private-key-value')
})
it('only permits uploads owned by the authenticated account', () => {
  expect(assertOwnedUpload(upload,user).hostname).toBe('example.supabase.co')
  for (const url of ['http://127.0.0.1/admin', upload.replace(user,'another-user'),upload.replace('example.supabase.co','evil.example'), upload.replace('/sign/','/public/'),upload.replace('lesson.pdf','%ZZ')]) {
    expect(() => assertOwnedUpload(url,user)).toThrow()
  }
})
it('refuses oversized storage responses and forbids redirects', async () => {
  const fetchMock = jest.spyOn(global,'fetch').mockResolvedValue(new Response('test', {headers:{'content-length':String(11*1024*1024)}}))
  await expect(downloadOwnedUpload(upload,user)).rejects.toThrow('10 MB')
  expect(fetchMock).toHaveBeenCalledWith(expect.any(URL),expect.objectContaining({redirect:'error'}))
})
