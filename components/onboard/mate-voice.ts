"use client"

import { emitMateSpeechFrame } from "@/lib/mate-speech-motion"
import { mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

let speechAudioContext: AudioContext | null = null
let audio: HTMLAudioElement | null = null
let objectUrl: string | null = null
let utterance: SpeechSynthesisUtterance | null = null
let scene = 0
let settlePlayback: (() => void) | null = null
let interactionUnlocked = false
const pendingClips = new Map<string, Promise<Blob | undefined>>()
const clipCache = new Map<string, Blob>()

export type SpeakMateOpts = {
  onStart?: () => void
  onPause?: () => void
  onProgress?: (progress: number) => void
}

const CLIP_TONE = "puck-v1"

function revision(text: string) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function clipKey(phrase: string, locale: string, text: string) {
  return `${locale.startsWith("fr") ? "fr" : "en"}:${phrase}:${CLIP_TONE}:${revision(text)}`
}

function voiceUrl(phrase: string, tag: string, text: string, custom = false) {
  const prompt = custom ? `text=${encodeURIComponent(text)}` : `phrase=${encodeURIComponent(phrase)}`
  return `/api/skulmate/voice?${prompt}&locale=${tag}&tone=${CLIP_TONE}&v=${revision(text)}`
}

function killPlayback() {
  settlePlayback?.()
  settlePlayback = null
  if (audio) {
    audio.pause()
    audio.src = ""
    audio = null
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  utterance = null
}

export function stopMateVoice() {
  scene += 1
  killPlayback()
}

function voiceEnabled() {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem("skulmate.voiceOut") !== "off"
  } catch {
    return true
  }
}

/** Browsers block unprompted sound. A Listen tap unlocks Mate for this flow. */
export async function unlockMateVoice() {
  interactionUnlocked = true
  if (typeof window === "undefined" || !window.AudioContext) return
  try {
    speechAudioContext ??= new AudioContext()
    await speechAudioContext.resume()
  } catch {
    // Browser speech synthesis remains a useful fallback.
  }
}

function pickBrowserVoice(locale: string) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  const want = locale.startsWith("fr") ? "fr" : "en"
  const scored = voices
    .filter((voice) => voice.lang?.toLowerCase().startsWith(want))
    .map((voice) => {
      const name = voice.name.toLowerCase()
      let score = 0
      if (/daniel|thomas|henri|ryan|guy|jason|aaron|evan/.test(name)) score += 10
      if (/neural|natural|premium|enhanced/.test(name)) score += 2
      if (/samantha|karen|moira|victoria|amelie|amélie|siri.*female/.test(name)) score -= 10
      if (voice.localService) score += 1
      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0]?.voice
}

function playElement(el: HTMLAudioElement, opts: SpeakMateOpts) {
  return new Promise<void>((resolve, reject) => {
    let frame = 0
    let finished = false
    let lastProgress = -1
    let analyser: AnalyserNode | null = null
    let source: MediaElementAudioSourceNode | null = null
    let samples: Uint8Array<ArrayBuffer> | null = null
    let mouth = 0
    // Keep audio on its native path unless a running context is available.
    const connectMeter = async () => {
      if (!window.AudioContext) return
      try {
        speechAudioContext ??= new AudioContext()
        await speechAudioContext.resume()
        if (finished || speechAudioContext.state !== "running") return
        analyser = speechAudioContext.createAnalyser()
        analyser.fftSize = 256
        samples = new Uint8Array(analyser.fftSize)
        source = speechAudioContext.createMediaElementSource(el)
        source.connect(analyser); analyser.connect(speechAudioContext.destination)
      } catch { /* Mouth still uses the normal talking clip when metering is unavailable. */ }
    }
    void connectMeter()
    const watchdog = window.setTimeout(() => finish(new Error("audio timeout")), 60000)
    const finish = (error?: Error) => {
      if (finished) return
      finished = true
      cancelAnimationFrame(frame)
      window.clearTimeout(watchdog)
      el.onplaying = el.onpause = el.onwaiting = el.onended = el.onerror = null
      if (settlePlayback === cancel) settlePlayback = null
      source?.disconnect(); analyser?.disconnect()
      emitMateSpeechFrame(null)
      opts.onPause?.()
      if (error) reject(error)
      else resolve()
    }
    const cancel = () => finish()
    settlePlayback = cancel
    const tick = () => {
      if (finished) return
      if (Number.isFinite(el.duration) && el.duration > 0) {
        const progress = Math.min(1, el.currentTime / el.duration)
        // Use the media clock, including pauses, rather than a typing timer.
        if (progress !== lastProgress) { opts.onProgress?.(progress); lastProgress = progress }
      }
      if (analyser && samples) {
        analyser.getByteTimeDomainData(samples)
        let energy = 0
        for (const value of samples) energy += ((value - 128) / 128) ** 2
        const target = Math.min(1, Math.max(0, (Math.sqrt(energy / samples.length) - .012) * 7))
        mouth += (target - mouth) * (target > mouth ? .8 : .45)
        emitMateSpeechFrame(mouth)
      }
      frame = requestAnimationFrame(tick)
    }
    el.onplaying = () => { opts.onStart?.(); cancelAnimationFrame(frame); tick() }
    el.onpause = el.onwaiting = () => { cancelAnimationFrame(frame); emitMateSpeechFrame(0); opts.onPause?.() }
    el.onended = () => { opts.onProgress?.(1); finish() }
    el.onerror = () => finish(new Error("audio"))
    el.play().catch(error => finish(error))
  })
}

function speakBrowser(text: string, locale: string, opts: SpeakMateOpts) {
  if (!window.speechSynthesis) return Promise.reject(new Error("no speech"))
  window.speechSynthesis.cancel()
  const line = new SpeechSynthesisUtterance(text)
  line.lang = locale.startsWith("fr") ? "fr-FR" : "en-GB"
  line.rate = 0.98
  line.pitch = 1.12
  line.volume = 1
  const chosen = pickBrowserVoice(locale)
  if (chosen) line.voice = chosen
  utterance = line
  return new Promise<void>((resolve) => {
    let finished = false
    let startTimer = 0
    let endTimer = 0
    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(startTimer); window.clearTimeout(endTimer)
      line.onstart = line.onend = line.onerror = line.onboundary = null
      if (settlePlayback === cancel) settlePlayback = null
      opts.onPause?.()
      opts.onProgress?.(1)
      resolve()
    }
    const cancel = () => finish()
    settlePlayback = cancel
    startTimer = window.setTimeout(() => { window.speechSynthesis.cancel(); finish() }, 2500)
    line.onstart = () => {
      window.clearTimeout(startTimer)
      endTimer = window.setTimeout(() => { window.speechSynthesis.cancel(); finish() }, 60000)
      opts.onStart?.()
    }
    line.onboundary = event => {
      if (event.charIndex !== undefined) {
        opts.onProgress?.(Math.min(1, (event.charIndex + (event.charLength || 1)) / text.length))
      }
    }
    line.onend = line.onerror = finish
    window.speechSynthesis.speak(line)
  })
}

// Share prefetch with playback so onboarding never synthesizes a line twice.
async function loadClip(key: string, url: string): Promise<Blob | undefined> {
  const cached = clipCache.get(key)
  if (cached) return cached
  const pending = pendingClips.get(key)
  if (pending) return pending
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 4500)
  const request = (async () => {
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return undefined
      const blob = await res.blob()
      if (!blob.size || !blob.type.startsWith("audio/")) return undefined
      if (clipCache.size >= 40) clipCache.delete(clipCache.keys().next().value!)
      clipCache.set(key, blob)
      return blob
    } catch { return undefined }
    finally { window.clearTimeout(timeout); pendingClips.delete(key) }
  })()
  pendingClips.set(key, request)
  return request
}

export async function prefetchMateLine(phrase: string, locale: string) {
  if (!voiceEnabled()) return
  const text = mateVoiceText(phrase, locale)
  if (!text) return
  const tag = locale.startsWith("fr") ? "fr" : "en"
  await loadClip(clipKey(phrase, tag, text), voiceUrl(phrase, tag, text))
}

async function speak(text: string, phrase: string, locale: string, opts: SpeakMateOpts, custom: boolean) {
  stopMateVoice()
  const mine = scene
  // Every callback is scoped to this utterance, including late browser events.
  const current: SpeakMateOpts = {
    onStart: () => { if (mine === scene) opts.onStart?.() },
    onPause: () => { if (mine === scene) opts.onPause?.() },
    onProgress: progress => { if (mine === scene) opts.onProgress?.(progress) },
  }
  if (!text.trim() || !voiceEnabled()) { current.onProgress?.(1); return }
  // Keep the written prompt responsive until the browser has a user gesture.
  // The persistent Listen button then starts sound reliably instead of silently
  // failing through autoplay policy.
  if (!interactionUnlocked) { current.onProgress?.(1); return }
  const tag = locale.startsWith("fr") ? "fr" : "en"
  current.onProgress?.(0)
  const blob = await loadClip(clipKey(phrase, tag, text), voiceUrl(phrase, tag, text, custom))
  if (mine !== scene) return false
  try {
    if (blob) {
      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.muted = false
      audio.volume = 1
      audio.preload = "auto"
      await playElement(audio, current)
      return mine === scene
    }
  } catch {
    if (mine !== scene) return false
    killPlayback()
  }
  if (mine !== scene) return false
  await speakBrowser(text, tag, current).catch(() => undefined)
  if (mine === scene) { current.onPause?.(); current.onProgress?.(1) }
  return mine === scene
}

export async function speakMateLine(phrase: string, locale: string, enabledOrOpts: boolean | SpeakMateOpts = true) {
  if (enabledOrOpts === false) { stopMateVoice(); return }
  const opts = typeof enabledOrOpts === "boolean" ? {} : enabledOrOpts
  return await speak(mateVoiceText(phrase, locale) || "", phrase, locale, opts, false)
}

/** Speak a personalized line using the same cancellation and playback clock. */
export async function speakMateText(text: string, locale: string, opts: SpeakMateOpts = {}) {
  return await speak(text, "custom", locale, opts, true)
}
