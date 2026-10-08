/** OpenRouter Gemini returns signed 16-bit little-endian PCM, normally 24kHz mono. */
export function pcmToWav(pcm: ArrayBuffer, contentType: string | null): ArrayBuffer {
  const rate = Number(contentType?.match(/\brate=(\d+)/i)?.[1] ?? 24000)
  const channels = Number(contentType?.match(/\bchannels=(\d+)/i)?.[1] ?? 1)
  if (rate < 8000 || rate > 192000 || channels < 1 || channels > 2 || !pcm.byteLength || pcm.byteLength % (channels * 2)) {
    throw new Error("Invalid PCM audio")
  }
  const wav = new ArrayBuffer(44 + pcm.byteLength)
  const view = new DataView(wav)
  const label = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }
  label(0, "RIFF")
  view.setUint32(4, 36 + pcm.byteLength, true)
  label(8, "WAVE")
  label(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  label(36, "data")
  view.setUint32(40, pcm.byteLength, true)
  new Uint8Array(wav, 44).set(new Uint8Array(pcm))
  return wav
}
