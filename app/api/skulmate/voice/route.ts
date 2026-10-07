import { NextRequest, NextResponse } from "next/server"
import { MATE_VOICE_LINES, mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

import { pcmToWav } from "@/lib/skulmate/pcm-audio"

export const runtime = "nodejs"

// OpenRouter is the primary provider. Keep the model configurable because
// voice names are model-specific and OpenRouter's catalog changes over time.
const MODEL = process.env.SKULMATE_TTS_MODEL || process.env.PRIMAR_TTS_MODEL || "google/gemini-3.1-flash-tts-preview"
const ELEVEN_MODEL = process.env.SKULMATE_ELEVEN_MODEL || "eleven_multilingual_v2"

/**
 * Voice IDs are supplied by the selected OpenRouter model. These defaults are
 * valid for Gemini TTS; set the env vars when selecting another model.
 */
const VOICES: Record<string, string> = {
  en: process.env.SKULMATE_TTS_VOICE_EN || "Kore",
  fr: process.env.SKULMATE_TTS_VOICE_FR || "Aoede",
}

/** Younger, softer than a straight adult read. Keep the same speaker. */
const SOFT_SPEED = 1.04
const SOFT_STYLE = "friendly"
const SOFT_STYLE_DEGREE = 0.85

async function elevenLabsSpeech(text: string, locale: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voice = locale === "fr"
    ? process.env.SKULMATE_ELEVEN_VOICE_FR
    : process.env.SKULMATE_ELEVEN_VOICE_EN
  if (!apiKey || !voice) return null

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL,
        voice_settings: { stability: 0.55, similarity_boost: 0.8, speed: 0.98 },
      }),
    },
  )
  if (!response.ok) return null
  return response
}

function pickVoice(params: URLSearchParams, locale: string) {
  const asked = params.get("voice")
  if (asked && /^[a-zA-Z0-9._-]{1,80}$/.test(asked)) return asked
  return VOICES[locale]
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const locale = params.get("locale") === "fr" ? "fr" : "en"
  const phrase = params.get("phrase") || ""
  const customText = params.get("text") || ""
  const text = customText.trim().slice(0, 600) || mateVoiceText(phrase, locale)

  if (!text) {
    return NextResponse.json(
      { error: "Unknown prompt", knownPhrases: Object.keys(MATE_VOICE_LINES.en) },
      { status: 400 },
    )
  }

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Voice synthesis not configured", text }, { status: 503 })

  const format = MODEL.toLowerCase().includes("gemini") ? "pcm" : "mp3"
  const voice = pickVoice(params, locale)
  const payload: Record<string, unknown> = {
    model: MODEL,
    input: text,
    voice,
    response_format: format,
    speed: SOFT_SPEED,
  }

  // Azure style controls are not understood by Gemini and can cause a
  // request to fail. Only send them for Azure-backed models.
  if (MODEL.toLowerCase().includes("azure") || MODEL.toLowerCase().includes("mai-voice")) {
    payload.provider = { options: { azure: { style: SOFT_STYLE, styledegree: SOFT_STYLE_DEGREE } } }
  }

  try {
    let upstream = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok && payload.provider && upstream.status === 400) {
      const plain = {
        model: MODEL,
        input: text,
        voice,
        response_format: format,
        speed: SOFT_SPEED,
      }
      upstream = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plain),
      })
    }

    if (!upstream.ok) {
      const eleven = process.env.SKULMATE_PREFER_ELEVENLABS === "true"
        ? await elevenLabsSpeech(text, locale).catch(() => null)
        : null
      if (eleven) {
        const audio = await eleven.arrayBuffer()
        return new NextResponse(audio, { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable", "Content-Length": String(audio.byteLength) } })
      }
      const detail = await upstream.text().catch(() => "")
      console.error("[skulmate/voice] upstream failed", upstream.status, detail.slice(0, 300))
      return NextResponse.json({ error: "Synthesis failed", text }, { status: 502 })
    }

    const raw = await upstream.arrayBuffer()
    const audio = format === "pcm" ? pcmToWav(raw, upstream.headers.get("content-type")) : raw
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": format === "pcm" ? "audio/wav" : "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(audio.byteLength),
      },
    })
  } catch (error) {
    console.error("[skulmate/voice] request error", error)
    return NextResponse.json({ error: "Synthesis failed", text }, { status: 502 })
  }
}
