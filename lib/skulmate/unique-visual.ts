/**
 * Unique pictures every turn, with no API keys.
 * Cloud Flux via OpenRouter can replace these when a key exists.
 * The seed must change each turn so the picture is never a poster.
 */

const NAVY = '#1B2C4F'
const SKY = '#0EA5E9'
const YELLOW = '#EAB308'
const PAPER = '#FAF8F3'

export function hashSeed(parts: Array<string | number | null | undefined>): string {
  const raw = parts.map((p) => String(p ?? '')).join('|')
  let h = 2166136261
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function uniqueVisualDataUri(seed: string, subject?: string): string {
  const svg = uniqueVisualSvg(seed, subject)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function uniqueVisualSvg(seed: string, subject?: string): string {
  const n = parseInt(seed.replace(/[^0-9a-f]/gi, '').slice(0, 8) || '1', 16) || 1
  const layout = n % 5
  const rot = (n % 18) - 9
  const glyph = subjectGlyph(subject, n)
  const shapes = layoutShapes(n, layout)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
  <rect width="320" height="180" rx="22" fill="${PAPER}"/>
  <rect x="8" y="8" width="304" height="164" rx="18" fill="#fff" stroke="${NAVY}" stroke-width="4"/>
  <g transform="rotate(${rot} 160 90)">${shapes}</g>
  ${glyph}
</svg>`
}

function layoutShapes(n: number, layout: number): string {
  if (layout === 0) return constellation(n)
  if (layout === 1) return petals(n)
  if (layout === 2) return tiles(n)
  if (layout === 3) return path(n)
  return waves(n)
}

function constellation(n: number): string {
  const dots = Array.from({ length: 7 }, (_, i) => {
    const x = 50 + ((n * (i + 3)) % 220)
    const y = 36 + ((n >> (i + 1)) % 110)
    const r = 6 + (i % 4)
    const fill = i % 3 === 0 ? SKY : i % 3 === 1 ? YELLOW : NAVY
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
  })
  return `${dots.join('')}<path d="M70 50 L160 90 L250 60" fill="none" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>`
}

function petals(n: number): string {
  const count = 5 + (n % 3)
  const petalsSvg = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (n % 12) / 10
    const x = 160 + Math.cos(a) * 48
    const y = 90 + Math.sin(a) * 34
    const fill = i % 2 ? SKY : YELLOW
    return `<ellipse cx="${x}" cy="${y}" rx="22" ry="12" fill="${fill}" opacity="0.9" transform="rotate(${(a * 180) / Math.PI} ${x} ${y})"/>`
  })
  return `${petalsSvg.join('')}<circle cx="160" cy="90" r="16" fill="${NAVY}"/>`
}

function tiles(n: number): string {
  const cells = Array.from({ length: 6 }, (_, i) => {
    const x = 36 + (i % 3) * 84
    const y = 32 + Math.floor(i / 3) * 62
    const fill = (n + i) % 3 === 0 ? '#E0F2FE' : (n + i) % 3 === 1 ? '#FEF3C7' : '#fff'
    return `<rect x="${x}" y="${y}" width="72" height="50" rx="12" fill="${fill}" stroke="${NAVY}" stroke-width="3"/>`
  })
  return cells.join('')
}

function path(n: number): string {
  const y1 = 40 + (n % 40)
  const y2 = 140 - (n % 50)
  return `<path d="M40 ${y1} C110 20, 210 160, 280 ${y2}" fill="none" stroke="${SKY}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="40" cy="${y1}" r="10" fill="${YELLOW}" stroke="${NAVY}" stroke-width="3"/>
  <circle cx="280" cy="${y2}" r="10" fill="${NAVY}"/>`
}

function waves(n: number): string {
  const phase = n % 30
  return `<path d="M24 ${90 + (phase % 12)} C80 ${40 + phase}, 140 ${140 - phase}, 200 90 S280 ${50 + (phase % 20)}, 296 96" fill="none" stroke="${SKY}" stroke-width="7" stroke-linecap="round"/>
  <path d="M24 ${110 + (phase % 8)} C90 160, 170 40, 296 110" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round"/>`
}

function subjectGlyph(subject?: string, n = 1): string {
  const id = (subject || '').toLowerCase()
  if (/math|algebra|calc/.test(id)) {
    return `<polygon points="250,36 286,92 214,92" fill="${SKY}" stroke="${NAVY}" stroke-width="3"/>`
  }
  if (/bio|svt|life|plant/.test(id)) {
    return `<ellipse cx="258" cy="48" rx="18" ry="28" fill="#86EFAC" stroke="${NAVY}" stroke-width="3"/>`
  }
  if (/phys|force|chem|pct/.test(id)) {
    return `<circle cx="258" cy="48" r="18" fill="${YELLOW}" stroke="${NAVY}" stroke-width="3"/><path d="M258 30 v36 M240 48 h36" stroke="${NAVY}" stroke-width="3"/>`
  }
  if (/hist|geo|econ/.test(id)) {
    return `<rect x="236" y="28" width="52" height="40" rx="8" fill="#FEF3C7" stroke="${NAVY}" stroke-width="3"/>`
  }
  if (n % 2 === 0) {
    return `<circle cx="258" cy="48" r="16" fill="${SKY}"/>`
  }
  return `<rect x="242" y="32" width="32" height="32" rx="8" fill="${YELLOW}" stroke="${NAVY}" stroke-width="3"/>`
}
