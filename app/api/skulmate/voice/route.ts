import { NextRequest, NextResponse } from "next/server"
import { MATE_VOICE_LINES, mateVoiceText } from "@/lib/skulmate/mate-voice-lines"

export const runtime = "nodejs"

const MODEL = process.env.SKULMATE_TTS_MODEL || process.env.PRIMAR_TTS_MODEL || "microsoft/mai-voice-2"

/**
 * Young, friendly mascot voice. Abeo is a young male Nigerian English neural
 * voice, the closest neighbour accent we can ship for Anglophone Cameroon.
 * Francophone falls back to Henri, a natural young-adult French male.
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

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Voice synthesis not configured", text }, { status: 503 })
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: text,
        voice: pickVoice(params, locale),
        response_format: "mp3",
      }),
    })

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
