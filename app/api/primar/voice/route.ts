import { NextRequest, NextResponse } from 'next/server'

/**
 * Voice synthesis for the foundational-learning experiment.
 *
 * Runs server-side because the Flutter client must never hold a third-party
 * key — the same rule every other integration in this codebase follows.
 *
 * The spoken vocabulary is a CLOSED set of a dozen short phrases, which changes
 * the economics completely: each line is synthesised once, cached on the device
 * forever, and never requested again. That buys the best available voice for a
 * fraction of a cent in total, rather than trading quality away to save money.
 * It also means the good voice keeps working with the network off.
 *
 * Only known phrase ids are accepted. An open text parameter would turn this
 * into a free TTS proxy for anyone who found the URL.
 */

export const runtime = 'nodejs'

/** Must stay in sync with VoiceLines in the Flutter client. */
const PHRASES: Record<string, string> = {
  watch: 'Watch.',
  these_make_this: 'These two make this one.',
  take_away: 'Take this part away.',
  your_turn: 'Now you try. Which one fits?',
  yes: 'Yes!',
  nice_one: 'Nice one.',
  that_is_it: 'That is it.',
  good: 'Good.',
  this_one: 'This one.',
  look_again: 'Look. This one fits.',
  all_done: 'All done. Well done.',
  find_the_same: 'Find the same one.',
  match_them: 'Join each group to its number.',
  well_matched: 'All joined. Well done.',
  say_it_back: 'Now you say it.',
  i_heard_you: 'I heard you! Well done.',
  good_try: 'Good try. Let us keep going.',
  another_way: 'Let us try that a different way.',
  look_at_both: 'Look at both of them together.',
  put_in_order: 'Drag them in order. Smallest first.',
  build_the_word: 'Tap the letters to build the word.',
  well_ordered: 'In order. Well done.',
  it_is_this_one: 'It is this one.',
  lets_count: "Let's count together.",
  so_that_makes: 'So that makes',
  this_letter_says: 'This letter says',
  listen: 'Listen.',
  now_you_try: 'Now you try.',
  take_your_time: 'Take your time.',
  have_a_look: 'Have a good look.',
  you_can_do_it: 'You can do this.',
  // Spoken on the very first screen. A parent who cannot read needs the
  // instructions aloud as much as the child does — assuming otherwise puts the
  // product out of reach of exactly the family it is for.
  welcome_parent:
    'Welcome. I will ask you four short questions, one at a time, so we can start your child in the right place.',
  welcome_pick: 'Pick shapes, numbers, or letters.',
  handoff_parent: 'Now give the phone to your child. They do not need help.',
  result_parent: 'Here is where your child is working now, and what comes next.',
  // One line per onboarding question. A single welcome line was the same voice
  // for five different screens, which is no better than silence for a parent
  // who cannot read the question in front of them.
  ask_language: 'Which language is your child learning to read in?',
  ask_voice: 'Who would you like to teach your child?',
  voice_sample: 'Hello! I am going to help you learn. Let us start.',
  ask_name: "What is your child's first name?",
  ask_age: 'How old are they?',
  ask_age_why:
    'This only chooses the first question. What your child does decides the rest.',
  ask_school: 'How much school have they had this year?',
  ask_subject: 'What should we look at first? Shapes, numbers, or letters.',
  ask_seen_reading: 'Which of these have you seen them do with letters?',
  ask_seen_numbers: 'Which of these have you seen them do with numbers?',
  ask_seen_shapes: 'Which of these have you seen them do with shapes?',
  warm_up_child: 'Let us try three quick ones first. Just have a go.',
  warm_up_done: 'Good. Now the real game.',
  how_many: 'How many?',
  find_this_many: 'Find this many.',
  which_is_more: 'Which one has the most?',
  how_many_altogether: 'How many altogether?',
  how_many_left: 'How many are left?',
  what_is_missing: 'What is missing?',
}

/**
 * Reading needs two more closed catalogues: the sound each letter makes, and
 * the words a child is learning to decode.
 *
 * Letter prompts speak the SOUND, never the alphabet name — a child blending
 * "cat" needs /k/, not "see". These stay in sync with lib/features/primar/
 * domain/literacy.dart, and a Dart test asserts every prompt an item can
 * produce exists here, because a missing line is a question with no question.
 */
const SOUNDS_EN = ['mmm','sss','aah','tuh','puh','nnn','kuh','duh','guh','ohh','buh','fff','eh','lll','huh','rrr','ih','uh','juh','vvv','wuh','yuh','zzz']
const SOUNDS_FR = ['ah','ee','oh','ue','euh','mmm','lll','sss','rrr','fff','puh','tuh','duh','nnn','vvv']

const WORDS_EN = ['cat','dog','sun','cup','bed','pen','hat','map','bag','box','leg','pot','six','van','web','zip','run','big','red','top','yam','hut','fan','net','pig','bus','log','mat','jug','kid','hen','tin','pan','mango','plantain','drum','ball','apple','key','star','tap','ant','kite','nest','vase','yoyo',
  // Phrase joiners. Not in the word bank because they cannot be drawn, but a
  // phrase read aloud with a silent gap in it is worse than no phrase at all.
  'on','in',
  // Longer words, for counting syllables.
  'banana','tomato','umbrella']
const WORDS_FR = ['lit','sac','mur','rue','pot','bus','dos','bol','tapis','lune','porte','robe','tasse','moto','vélo','main','pain','chat','rat','nid','sel','mangue','sur','poule','ballon']

/** Number words, so a total can be named rather than only shown. */
const NUMBER_WORDS_EN = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty']
const NUMBER_WORDS_FR = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix',
  'onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt']

const MODEL = process.env.PRIMAR_TTS_MODEL || 'microsoft/mai-voice-2'

/**
 * Voice selection, and why these names.
 *
 * The model is served through Azure, so voices use Azure Neural locale names —
 * short aliases like "alloy" or "nova" are rejected. Probing the endpoint found
 * genuine African English locales available at the same price as any other:
 *
 *   en-NG  Ezinne / Abeo      (Nigeria)
 *   en-KE  Asilia / Chilemba  (Kenya)
 *   en-ZA  Leah               (South Africa)
 *   en-TZ  Imani              (Tanzania)
 *
 * There is no Cameroonian locale, and no African French locale at all —
 * fr-CM, fr-SN and fr-CI are all rejected. Nigerian English is the closest
 * neighbour accent to Anglophone Cameroon and is far nearer a child's ear than
 * en-US, which is why it is the default rather than an American voice.
 * Francophone learners fall back to fr-FR because nothing closer exists.
 *
 * Note: this model reports supports_voice_cloning = false on OpenRouter, so
 * cloning a local teacher's voice is not possible here. Doing that would mean
 * moving to a cloning-capable model such as fish-audio/s2.1-pro.
 */
const VOICES: Record<string, string> = {
  en: process.env.PRIMAR_TTS_VOICE_EN || 'en-NG-EzinneNeural',
  fr: process.env.PRIMAR_TTS_VOICE_FR || 'fr-FR-DeniseNeural',
}

/**
 * Voices a client may ask for by name.
 *
 * An allowlist rather than a passthrough. The voice name goes straight to the
 * provider, so accepting whatever arrives would let anyone who found this URL
 * bill arbitrary voices to this account — the same reason the phrase catalogue
 * is closed rather than taking free text.
 */
const ALLOWED_VOICES = new Set([
  'en-NG-EzinneNeural',
  'en-NG-AbeoNeural',
  'en-KE-AsiliaNeural',
  'en-KE-ChilembaNeural',
  'fr-FR-DeniseNeural',
])

/** The requested voice if it is one we offer, otherwise the locale default. */
function pickVoice(params: URLSearchParams, locale: string): string {
  const asked = params.get('voice')
  if (asked && ALLOWED_VOICES.has(asked)) return asked
  return VOICES[locale]
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const locale = params.get('locale') === 'fr' ? 'fr' : 'en'

  const phraseId = params.get('phrase')
  const sound = params.get('sound')
  const word = params.get('word')
  const letter = params.get('letter')
  const number = params.get('number')
  const count = params.get('count')

  const words = locale === 'fr' ? NUMBER_WORDS_FR : NUMBER_WORDS_EN

  let text: string | undefined
  if (phraseId) {
    text = PHRASES[phraseId]
  } else if (letter) {
    // The letter's NAME, used while teaching. Its sound is a separate line.
    if (/^[a-z]$/.test(letter)) text = letter.toUpperCase()
  } else if (number) {
    const n = Number(number)
    if (Number.isInteger(n) && n >= 0 && n < words.length) text = words[n]
  } else if (count) {
    // Counting aloud, one mark at a time. This is the teaching itself for a
    // child who cannot yet recognise a quantity at a glance.
    const n = Number(count)
    if (Number.isInteger(n) && n >= 1 && n <= 10) {
      text = Array.from({ length: n }, (_, i) => words[i + 1]).join('. ') + '.'
    }
  } else if (sound) {
    // Spoken slowly and drawn out, which is how a letter sound is taught.
    const allowed = locale === 'fr' ? SOUNDS_FR : SOUNDS_EN
    if (allowed.includes(sound)) text = sound
  } else if (word) {
    const allowed = locale === 'fr' ? WORDS_FR : WORDS_EN
    if (allowed.includes(word)) text = word
  }

  if (!text) {
    return NextResponse.json(
      {
        error: 'Unknown prompt',
        knownPhrases: Object.keys(PHRASES),
        knownSounds: locale === 'fr' ? SOUNDS_FR : SOUNDS_EN,
        knownWords: locale === 'fr' ? WORDS_FR : WORDS_EN,
        knownLetters: 'a-z',
        knownNumbers: '0-20',
        knownCounts: '1-10',
      },
      { status: 400 },
    )
  }

  const apiKey = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    // The client falls back to the device voice, so a missing key degrades the
    // experience without ever breaking a session.
    return NextResponse.json({ error: 'Voice synthesis not configured' }, { status: 503 })
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    input: text,
    voice: pickVoice(params, locale),
    response_format: 'mp3',
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[primar/voice] upstream failed', upstream.status, detail.slice(0, 300))
      return NextResponse.json({ error: 'Synthesis failed' }, { status: 502 })
    }

    const audio = await upstream.arrayBuffer()

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        // The text for a given id never changes, so this is safe to cache hard
        // at every layer between here and the device.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(audio.byteLength),
      },
    })
  } catch (error) {
    console.error('[primar/voice] request error', error)
    return NextResponse.json({ error: 'Synthesis failed' }, { status: 502 })
  }
}
