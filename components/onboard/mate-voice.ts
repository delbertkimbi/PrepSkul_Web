"use client"

import { mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

let audio: HTMLAudioElement | null = null
let objectUrl: string | null = null
let utterance: SpeechSynthesisUtterance | null = null

export function stopMateVoice() {
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
      if (/abeo|henri|guy|jason|ryan|thomas|david|george|neural/.test(name)) score += 4
      if (/male|boy|young/.test(name)) score += 3
      if (/google|samantha|karen|moira/.test(name)) score += 1
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
  line.rate = 1.04
  line.pitch = 1.12
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

export async function speakMateLine(phrase: string, locale: string, enabled = true) {
  if (!enabled || !voiceEnabled()) return
  const text = mateVoiceText(phrase, locale)
  if (!text) return
  stopMateVoice()
  const tag = locale.startsWith("fr") ? "fr" : "en"
  try {
    const res = await fetch(`/api/skulmate/voice?phrase=${encodeURIComponent(phrase)}&locale=${tag}`)
    if (res.ok) {
      const blob = await res.blob()
      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.muted = false
      audio.volume = 1
      audio.preload = "auto"
      await playElement(audio)
      return
    }
  } catch {
    /* try the device voice */
  }
  await speakBrowser(text, tag)
}
