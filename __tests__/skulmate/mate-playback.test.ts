import { prefetchMateLine, speakMateLine, speakMateText, stopMateVoice } from '@/components/onboard/mate-voice'
jest.mock('@/lib/mate-speech-motion', () => ({ emitMateSpeechFrame: jest.fn() }))
jest.mock('@/lib/skulmate/mate-voice-lines', () => ({ mateVoiceText: (phrase: string) => `Line ${phrase}` }))

class FakeAudio {
  static all: FakeAudio[] = []
  currentTime = 0; duration = 10; src: string; preload = ''
  onplaying: (() => void) | null = null
  onpause: (() => void) | null = null
  onwaiting: (() => void) | null = null
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(src: string) { this.src = src; FakeAudio.all.push(this) }
  play = jest.fn(async () => { this.onplaying?.() })
  pause = jest.fn(() => { this.onpause?.() })
}
const flush = async () => { for (let i=0;i<20;i++) await Promise.resolve() }
const fetchMock = jest.fn()
let muted = false
let raf: Map<number, FrameRequestCallback>
let frameId = 0
beforeEach(() => {
  jest.useFakeTimers()
  FakeAudio.all = []; raf = new Map(); muted = false
  Object.assign(globalThis, {
    window: {setTimeout, clearTimeout, localStorage:{getItem:()=>muted?'off':'on'}, speechSynthesis:{cancel:jest.fn()}},
    Audio: FakeAudio,
    fetch: fetchMock,
    requestAnimationFrame: (cb:FrameRequestCallback) => { raf.set(++frameId,cb); return frameId },
    cancelAnimationFrame: (id:number) => raf.delete(id),
  })
  URL.createObjectURL = jest.fn(() => 'blob:mate')
  URL.revokeObjectURL = jest.fn()
  fetchMock.mockReset().mockResolvedValue({ok:true,blob:async()=>new Blob(['audio'],{type:'audio/wav'})})
})
afterEach(() => { stopMateVoice(); jest.useRealTimers() })

test('reveals text from the media clock, pauses on buffering, and finishes with audio', async () => {
  const onStart=jest.fn(), onPause=jest.fn(), onProgress=jest.fn()
  const spoken=speakMateLine('clock','en',{onStart,onPause,onProgress})
  await flush()
  const audio=FakeAudio.all[0]
  expect(onStart).toHaveBeenCalledTimes(1)
  audio.currentTime=4
  for(const [id,cb] of [...raf]) { raf.delete(id); cb(4000) }
  expect(onProgress).toHaveBeenLastCalledWith(.4)
  audio.onwaiting?.()
  expect(onPause).toHaveBeenCalled()
  expect(raf.size).toBe(0)
  audio.onplaying?.()
  expect(onStart).toHaveBeenCalledTimes(2)
  audio.onended?.()
  await spoken
  expect(onProgress).toHaveBeenLastCalledWith(1)
  expect(raf.size).toBe(0)
})

test('cancels and settles an old utterance without callbacks on the next screen', async () => {
  const oldProgress=jest.fn()
  const old=speakMateLine('old-scene','en',{onProgress:oldProgress})
  await flush()
  const audio=FakeAudio.all[0], lateEnd=audio.onended
  const next=speakMateLine('next-scene','en')
  await flush()
  expect(await old).toBe(false)
  const count=oldProgress.mock.calls.length
  lateEnd?.()
  expect(oldProgress).toHaveBeenCalledTimes(count)
  expect(audio.pause).toHaveBeenCalled()
  FakeAudio.all[1].onended?.()
  expect(await next).toBe(true)
})

test('shares an in-flight prefetched voice clip with playback', async () => {
  let respond!: (value:unknown)=>void
  fetchMock.mockImplementationOnce(()=>new Promise(resolve=>{respond=resolve}))
  const prefetch=prefetchMateLine('deduplicated','en')
  const speak=speakMateLine('deduplicated','en')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  respond({ok:true,blob:async()=>new Blob(['a'],{type:'audio/wav'})})
  await prefetch; await flush()
  FakeAudio.all[0].onended?.(); await speak
})

test('does not play a late response from a cancelled screen', async () => {
  let respond!: (value:unknown)=>void
  fetchMock.mockImplementationOnce(()=>new Promise(resolve=>{respond=resolve}))
  const speak=speakMateText('Cancelled custom line','en')
  stopMateVoice()
  respond({ok:true,blob:async()=>new Blob(['a'],{type:'audio/wav'})})
  expect(await speak).toBe(false)
  expect(FakeAudio.all).toHaveLength(0)
})

test('muted speech reveals the complete text without a network or audio request', async () => {
  muted=true; const onProgress=jest.fn()
  await speakMateText('Silent reading','en',{onProgress})
  expect(onProgress).toHaveBeenLastCalledWith(1)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(FakeAudio.all).toHaveLength(0)
})

test('unavailable speech still reveals text and lets onboarding continue', async () => {
  fetchMock.mockRejectedValueOnce(new Error('offline'))
  const onProgress=jest.fn()
  // Browser speech may be unavailable in embedded browsers.
  ;(window as any).speechSynthesis=undefined
  await speakMateText('Offline line','en',{onProgress})
  expect(onProgress).toHaveBeenLastCalledWith(1)
})
