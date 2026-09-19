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
}

const CLIP_TONE = "soft"

function clipKey(phrase: string, locale: string) {
  return `${locale.startsWith("fr") ? "fr" : "en"}:${phrase}:${CLIP_TONE}`
}

function voiceUrl(phrase: string, tag: string) {
  return `/api/skulmate/voice?phrase=${encodeURIComponent(phrase)}&locale=${tag}&tone=${CLIP_TONE}`
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

function playElement(el: HTMLAudioElement) {
  return new Promise<void>((resolve, reject) => {
    el.onended = () => resolve()
    el.onerror = () => reject(new Error("audio"))
    el.play().then(() => undefined).catch(reject)
  })
}

function speakBrowser(text: string, locale: string) {
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
    line.onend = () => resolve()
    line.onerror = (event) => reject(event.error)
    window.speechSynthesis.speak(line)
    window.setTimeout(() => window.speechSynthesis.getVoices(), 0)
  })
}

function parseOpts(enabledOrOpts: boolean | SpeakMateOpts = true) {
  if (enabledOrOpts === false) return { enabled: false as const, onStart: undefined }
  if (enabledOrOpts === true) return { enabled: true as const, onStart: undefined }
  return { enabled: true as const, onStart: enabledOrOpts.onStart }
}

export async function prefetchMateLine(phrase: string, locale: string) {
  const text = mateVoiceText(phrase, locale)
  if (!text) return
  const tag = locale.startsWith("fr") ? "fr" : "en"
  const key = clipKey(phrase, tag)
  if (clipCache.has(key)) return
  try {
    const res = await fetch(voiceUrl(phrase, tag))
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
  const { enabled, onStart } = parseOpts(enabledOrOpts)
  if (!enabled || !voiceEnabled()) return
  const text = mateVoiceText(phrase, locale)
  if (!text) return

  const mine = ++scene
  fetchAbort?.abort()
  killPlayback()
  fetchAbort = new AbortController()
  const stale = () => mine !== scene
  const tag = locale.startsWith("fr") ? "fr" : "en"
  const key = clipKey(phrase, tag)

  try {
    let blob = clipCache.get(key)
    if (!blob) {
      const res = await fetch(voiceUrl(phrase, tag), {
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
      await playElement(audio)
      return
    }
  } catch {
    if (stale()) return
  }

  if (stale()) return
  onStart?.()
  await speakBrowser(text, tag)
}
