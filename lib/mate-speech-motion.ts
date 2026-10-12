/** Media-clock mouth motion; transient frames never go through React state. */
export const MATE_SPEECH_FRAME = 'mate:speech-frame'
export type MateSpeechFrame = { mouthOpen: number | null }
export function emitMateSpeechFrame(mouthOpen: number | null) {
  window.dispatchEvent(new CustomEvent<MateSpeechFrame>(MATE_SPEECH_FRAME, { detail: { mouthOpen } }))
}
