import { NextRequest, NextResponse } from 'next/server'

/**
 * Scene art for the foundational-learning experiment.
 *
 * Same shape as the voice route, and for the same reasons: the client holds no
 * key, and the catalogue is CLOSED. A scene is generated once, cached on the
 * device the first time it is shown, and never fetched again — so the app ships
 * with no art in the bundle, stays light, and works offline after first use.
 *
 * ## What is NOT generated
 *
 * Nothing that carries a lesson. Quantities, letters, numerals and shapes are
 * drawn from data and are correct by construction, because an image model that
 * draws six mangoes when the item says seven teaches a child the wrong thing.
 * These scenes are backgrounds and characters — warmth around the lesson, never
 * the lesson itself. If a prompt below ever needs to be counted, it is in the
 * wrong file.
 */

export const runtime = 'nodejs'

/**
 * Cheapest capable image model on OpenRouter as of this writing
 * ($0.25/M in, $1.50/M out — under half of gemini-3.1-flash-image).
 * Quality here only has to clear "warm and on-style", not "photoreal".
 */
const MODEL = process.env.PRIMAR_IMAGE_MODEL || 'google/gemini-3.1-flash-lite-image'

/**
 * The house style, applied to every scene so a hundred images still look like
 * one product. Written to match the paper-craft look the UI already draws:
 * torn edges, flat colour, visible texture, no gradients or 3D.
 */
const STYLE = [
  'Flat paper-collage illustration, cut-paper craft style.',
  'Torn and cut paper edges with visible grain texture.',
  'Warm off-white paper background (#FAF8F3).',
  'Limited palette: deep navy #132D63, bright blue #2864D7, teal #168C91,',
  'warm yellow #F5C843, brick red #C1443A.',
  'Bold simple shapes, thick rounded outlines, high contrast.',
  'Cheerful and childlike, suitable for children aged 6 to 10.',
  'No text, no letters, no numbers, no words anywhere in the image.',
  'No photorealism, no 3D render, no gradients, no drop shadows.',
  'Centred composition with generous empty margins.',
].join(' ')

/**
 * Scenes are named and fixed. An open prompt parameter would let anyone who
 * found the URL spend the image budget, and would let unreviewed art reach a
 * child's screen.
 *
 * Subjects are drawn from the world these children actually live in — the
 * market, the compound, plantain and mango rather than apples and snow. That
 * is most of what stops the product feeling like it was made somewhere else.
 */
const SCENES: Record<string, string> = {
  welcome_market:
    'A friendly Cameroonian market stall with baskets of plantains and mangoes, ' +
    'bright cloth awning, a few wooden crates.',
  celebrate_stars:
    'A burst of confetti, paper stars and streamers on an empty background, ' +
    'celebratory and light.',
  counting_yard:
    'A sunny compound yard with a mango tree, a few chickens and a low wall, ' +
    'empty foreground space.',
  reading_mat:
    'A woven raffia mat with an open blank picture book and two cushions, ' +
    'soft afternoon light.',
  quiet_evening:
    'A calm evening scene outside a house with a paraffin lamp and a stool, ' +
    'warm and restful.',
  school_walk:
    'A dirt path lined with palm trees leading toward a small school building, ' +
    'blue sky, a few clouds.',
}

export async function GET(request: NextRequest) {
  const sceneId = request.nextUrl.searchParams.get('scene') || ''
  const subject = SCENES[sceneId]

  if (!subject) {
    return NextResponse.json(
      { error: 'Unknown scene', known: Object.keys(SCENES) },
      { status: 400 },
    )
  }

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    // The client simply shows its drawn background instead, so a missing key
    // degrades the look without ever breaking a session.
    return NextResponse.json({ error: 'Image generation not configured' }, { status: 503 })
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: `${subject} ${STYLE}` }],
        modalities: ['image', 'text'],
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[primar/scene] upstream failed', upstream.status, detail.slice(0, 300))
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const json = await upstream.json()
    const images = json?.choices?.[0]?.message?.images
    const url: string | undefined = images?.[0]?.image_url?.url

    if (!url) {
      console.error('[primar/scene] no image in response', JSON.stringify(json).slice(0, 300))
      return NextResponse.json({ error: 'No image returned' }, { status: 502 })
    }

    // Models return a data: URI. Decode once here so the device stores plain
    // bytes rather than base64, which is a third larger on a phone that is
    // short of space.
    const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(url)
    if (!match) {
      return NextResponse.json({ error: 'Unexpected image encoding' }, { status: 502 })
    }

    const bytes = Buffer.from(match[2], 'base64')

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': match[1],
        // A given scene id always means the same picture, so this is safe to
        // cache hard at every layer between here and the device.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(bytes.byteLength),
      },
    })
  } catch (error) {
    console.error('[primar/scene] request error', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }
}
