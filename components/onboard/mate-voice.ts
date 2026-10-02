"use client"

import { mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

let audio: HTMLAudioElement | null = null
let objectUrl: string | null = null
let utterance: SpeechSynthesisUtterance | null = null
let scene = 0
let fetchAbort: AbortController | null = null
const clipCache = new Map<string, Blob>()

export type SpeakMateOpts = {
  onStart?: () => void
  onProgress?: (progress: number) => void
}

const CLIP_TONE = "soft"

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

function voiceUrl(phrase: string, tag: string, text: string) {
  return `/api/skulmate/voice?phrase=${encodeURIComponent(phrase)}&locale=${tag}&tone=${CLIP_TONE}&v=${revision(text)}`
}

function killPlayback() {
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
  fetchAbort?.abort()
  fetchAbort = null
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

function pickBrowserVoice(locale: string) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  const want = locale.startsWith("fr") ? "fr" : "en"
  const scored = voices
    .filter((voice) => voice.lang?.toLowerCase().startsWith(want))
    .map((voice) => {
      const name = voice.name.toLowerCase()
      let score = 0
      if (/abeo|henri/.test(name)) score += 6
      if (/boy|young|child|kid/.test(name)) score += 4
      if (/jason|ryan/.test(name)) score += 1
      if (/david|george|guy|thomas/.test(name)) score -= 3
      if (voice.localService) score += 1
      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0]?.voice
}

function playElement(el: HTMLAudioElement, onProgress?: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    el.ontimeupdate = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        onProgress?.(Math.min(1, el.currentTime / el.duration))
      }
    }
    el.onended = () => {
      onProgress?.(1)
      resolve()
    }
    el.onerror = () => reject(new Error("audio"))
    el.play().then(() => undefined).catch(reject)
  })
}

function speakBrowser(text: string, locale: string, onProgress?: (progress: number) => void) {
  if (!window.speechSynthesis) return Promise.reject(new Error("no speech"))
  window.speechSynthesis.cancel()
  const line = new SpeechSynthesisUtterance(text)
  line.lang = locale.startsWith("fr") ? "fr-FR" : "en-GB"
  line.rate = 0.98
  line.pitch = 1.28
  line.volume = 1
  const chosen = pickBrowserVoice(locale)
  if (chosen) line.voice = chosen
  utterance = line
  return new Promise<void>((resolve, reject) => {
    line.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        onProgress?.(Math.min(1, (event.charIndex + (event.charLength || 1)) / text.length))
      }
    }
    line.onend = () => {
      onProgress?.(1)
      resolve()
    }
    line.onerror = (event) => reject(event.error)
    window.speechSynthesis.speak(line)
    window.setTimeout(() => window.speechSynthesis.getVoices(), 0)
  })
}

function parseOpts(enabledOrOpts: boolean | SpeakMateOpts = true) {
  if (enabledOrOpts === false) return { enabled: false as const, onStart: undefined, onProgress: undefined }
  if (enabledOrOpts === true) return { enabled: true as const, onStart: undefined, onProgress: undefined }
  return { enabled: true as const, onStart: enabledOrOpts.onStart, onProgress: enabledOrOpts.onProgress }
}

export async function prefetchMateLine(phrase: string, locale: string) {
  const text = mateVoiceText(phrase, locale)
  if (!text) return
  const tag = locale.startsWith("fr") ? "fr" : "en"
  const key = clipKey(phrase, tag, text)
  if (clipCache.has(key)) return
  try {
    const res = await fetch(voiceUrl(phrase, tag, text))
    if (!res.ok) return
    const blob = await res.blob()
    if (!clipCache.has(key)) clipCache.set(key, blob)
  } catch {
    /* next speak will retry */
  }
}

export async function speakMateLine(
  phrase: string,
  locale: string,
  enabledOrOpts: boolean | SpeakMateOpts = true,
) {
  const { enabled, onStart, onProgress } = parseOpts(enabledOrOpts)
  if (!enabled || !voiceEnabled()) return
  const text = mateVoiceText(phrase, locale)
  if (!text) return

  const mine = ++scene
  fetchAbort?.abort()
  killPlayback()
  fetchAbort = new AbortController()
  const stale = () => mine !== scene
  const tag = locale.startsWith("fr") ? "fr" : "en"
  const key = clipKey(phrase, tag, text)

  try {
    let blob = clipCache.get(key)
    if (!blob) {
      const res = await fetch(voiceUrl(phrase, tag, text), {
        signal: fetchAbort.signal,
      })
      if (stale()) return
      if (res.ok) {
        blob = await res.blob()
        if (stale()) return
        clipCache.set(key, blob)
      }
    }
    if (blob && !stale()) {
      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.muted = false
      audio.volume = 1
      audio.preload = "auto"
      onStart?.()
      onProgress?.(0)
      await playElement(audio, onProgress)
      return
    }
  } catch {
    if (stale()) return
  }

  if (stale()) return
  onStart?.()
  onProgress?.(0)
  await speakBrowser(text, tag, onProgress)
}
