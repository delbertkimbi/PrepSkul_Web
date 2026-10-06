import { NextRequest, NextResponse } from "next/server"
import { MATE_VOICE_LINES, mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

export const runtime = "nodejs"

const MODEL = process.env.SKULMATE_TTS_MODEL || process.env.PRIMAR_TTS_MODEL || "microsoft/mai-voice-2"
const ELEVEN_MODEL = process.env.SKULMATE_ELEVEN_MODEL || "eleven_multilingual_v2"

/**
 * Keep Abeo's West African accent. The grown-man read comes from a flat
 * adult delivery, not the locale. Soften it: slightly lifted speed, a
 * friendly Azure style, and a cache-busting tone so old clips do not stick.
 * Francophone stays on Henri with the same delivery.
 */
const VOICES: Record<string, string> = {
  en: process.env.SKULMATE_TTS_VOICE_EN || "en-NG-AbeoNeural",
  fr: process.env.SKULMATE_TTS_VOICE_FR || "fr-FR-HenriNeural",
}

const ALLOWED_VOICES = new Set([
  "en-NG-AbeoNeural",
  "en-NG-EzinneNeural",
  "en-KE-ChilembaNeural",
  "fr-FR-HenriNeural",
  "fr-FR-DeniseNeural",
])

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
  if (asked && ALLOWED_VOICES.has(asked)) return asked
  return VOICES[locale]
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const locale = params.get("locale") === "fr" ? "fr" : "en"
  const phrase = params.get("phrase") || ""
  const text = mateVoiceText(phrase, locale)

  if (!text) {
    return NextResponse.json(
      { error: "Unknown prompt", knownPhrases: Object.keys(MATE_VOICE_LINES.en) },
      { status: 400 },
    )
  }

  const eleven = await elevenLabsSpeech(text, locale).catch(() => null)
  if (eleven) {
    const audio = await eleven.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(audio.byteLength),
      },
    })
  }

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Voice synthesis not configured", text }, { status: 503 })

  const voice = pickVoice(params, locale)
  const payload = {
    model: MODEL,
    input: text,
    voice,
    response_format: "mp3",
    speed: SOFT_SPEED,
    provider: {
      options: {
        azure: {
          style: SOFT_STYLE,
          styledegree: SOFT_STYLE_DEGREE,
        },
      },
    },
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

    if (!upstream.ok) {
      const plain = {
        model: MODEL,
        input: text,
        voice,
        response_format: "mp3",
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
      const detail = await upstream.text().catch(() => "")
      console.error("[skulmate/voice] upstream failed", upstream.status, detail.slice(0, 300))
      return NextResponse.json({ error: "Synthesis failed", text }, { status: 502 })
    }

    const audio = await upstream.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(audio.byteLength),
      },
    })
  } catch (error) {
    console.error("[skulmate/voice] request error", error)
    return NextResponse.json({ error: "Synthesis failed", text }, { status: 502 })
  }
}
