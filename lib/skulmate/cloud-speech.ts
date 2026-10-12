/**
 * Play OpenRouter neural TTS in the browser. Device voice is the fallback.
 */

export async function fetchCloudSpeech(text: string, language?: string): Promise<Blob | null> {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return null
  try {
    const response = await fetch('/api/skulmate/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, language }),
    })
    if (!response.ok || response.status === 204) return null
    const type = response.headers.get('content-type') || ''
    if (!type.includes('audio') && !type.includes('octet-stream')) return null
    const blob = await response.blob()
    if (!blob.size) return null
    return blob
  } catch {
    return null
  }
}

export function playBlob(blob: Blob): { audio: HTMLAudioElement; url: string } {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.preload = 'auto'
  return { audio, url }
}
