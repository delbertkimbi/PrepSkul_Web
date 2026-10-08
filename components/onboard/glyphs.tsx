import type { ReactNode } from "react"

/**
 * Duo-style rounded flag tiles for language and country.
 * Subjects and roles keep the paper-craft illustrations.
 */

const SUBJECT: Record<string, { src: string; bg: string }> = {
  student: { src: "tile-backpack.png", bg: "#DBEAFE" },
  parent: { src: "tile-heart.png", bg: "#FEF9C3" },
  maths: { src: "tile-maths.png", bg: "#FEF3C7" },
  french: { src: "tile-pencil.png", bg: "#FCE7F3" },
  english: { src: "tile-book.png", bg: "#DBEAFE" },
  pct: { src: "tile-flask.png", bg: "#E0F2FE" },
  svt: { src: "tile-flask.png", bg: "#D1FAE5" },
  histgeo: { src: "tile-globe.png", bg: "#FFEDD5" },
  philo: { src: "tile-book.png", bg: "#F3E8FF" },
  cs: { src: "tile-laptop.png", bg: "#E0E7FF" },
  physics: { src: "tile-flask.png", bg: "#E0F2FE" },
  chemistry: { src: "tile-flask.png", bg: "#FCE7F3" },
  biology: { src: "tile-flask.png", bg: "#D1FAE5" },
  geography: { src: "tile-globe.png", bg: "#FEF3C7" },
  literature: { src: "tile-book.png", bg: "#FCE7F3" },
  economics: { src: "tile-maths.png", bg: "#D1FAE5" },
  bepc: { src: "tile-medal.png", bg: "#FEF9C3" },
  bac: { src: "tile-medal.png", bg: "#DBEAFE" },
  probatoire: { src: "tile-medal.png", bg: "#E0F2FE" },
  gce: { src: "tile-pencil.png", bg: "#D1FAE5" },
  "ng-waec": { src: "tile-medal.png", bg: "#D1FAE5" },
  "gh-wassce": { src: "tile-medal.png", bg: "#FEF3C7" },
  "ke-cbc": { src: "tile-medal.png", bg: "#DBEAFE" },
  "za-nsc": { src: "tile-medal.png", bg: "#E0F2FE" },
  "fr-bac": { src: "tile-medal.png", bg: "#E0E7FF" },
  "gb-gcse": { src: "tile-medal.png", bg: "#DBEAFE" },
  "us-k12": { src: "tile-medal.png", bg: "#FEE2E2" },
  "global-open": { src: "tile-globe.png", bg: "#F3E8FF" },
}

export function Glyph({
  kind,
  selected = false,
}: {
  kind: string
  selected?: boolean
}) {
  const flag = flagFor(kind)
  const subject = SUBJECT[kind]
  return (
    <span
      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px]"
      style={{
        background: flag ? "#fff" : subject?.bg ?? "#E0F2FE",
        boxShadow: selected ? "0 4px 0 #1B2C4F" : "0 3px 0 rgba(27,44,79,0.18)",
        border: "2px solid #1B2C4F",
      }}
    >
      {flag ? (
        flag
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/onboard/art/${subject?.src ?? "tile-globe.png"}`}
          alt=""
          width={48}
          height={48}
          draggable={false}
          className="h-full w-full object-contain p-1"
        />
      )}
    </span>
  )
}

function flagFor(kind: string): ReactNode {
  switch (kind) {
    case "en":
    case "gb":
    case "cm-anglophone":
      return <UkFlag />
    case "fr":
    case "fr_country":
    case "cm-francophone":
      return <FranceFlag />
    case "cm":
      return <CameroonFlag />
    case "ng":
      return <NigeriaFlag />
    case "gh":
      return <GhanaFlag />
    case "ke":
      return <KenyaFlag />
    case "ci":
      return <IvoryCoastFlag />
    case "za":
      return <SouthAfricaFlag />
    case "us":
      return <UsFlag />
    case "global":
      return <GlobeMark />
    default:
      return null
  }
}

function FlagSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 60 44" width="100%" height="100%" aria-hidden preserveAspectRatio="none">
      {children}
    </svg>
  )
}

function UkFlag() {
  return (
    <FlagSvg>
      <rect width="60" height="44" fill="#012169" />
      <path d="M0 0 L60 44 M60 0 L0 44" stroke="#fff" strokeWidth="10" />
      <path d="M0 0 L60 44 M60 0 L0 44" stroke="#C8102E" strokeWidth="6" />
      <path d="M30 0 V44 M0 22 H60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0 V44 M0 22 H60" stroke="#C8102E" strokeWidth="7" />
    </FlagSvg>
  )
}

function FranceFlag() {
  return (
    <FlagSvg>
      <rect width="20" height="44" fill="#002395" />
      <rect x="20" width="20" height="44" fill="#fff" />
      <rect x="40" width="20" height="44" fill="#ED2939" />
    </FlagSvg>
  )
}

function CameroonFlag() {
  return (
    <FlagSvg>
      <rect width="20" height="44" fill="#007A5E" />
      <rect x="20" width="20" height="44" fill="#CE1126" />
      <rect x="40" width="20" height="44" fill="#FCD116" />
      <polygon points="30,14 32.4,21.2 40,21.2 33.8,25.6 36.2,33 30,28.4 23.8,33 26.2,25.6 20,21.2 27.6,21.2" fill="#FCD116" />
    </FlagSvg>
  )
}

function NigeriaFlag() {
  return (
    <FlagSvg>
      <rect width="20" height="44" fill="#008751" />
      <rect x="20" width="20" height="44" fill="#fff" />
      <rect x="40" width="20" height="44" fill="#008751" />
    </FlagSvg>
  )
}

function GhanaFlag() {
  return (
    <FlagSvg>
      <rect width="60" height="15" fill="#CE1126" />
      <rect y="15" width="60" height="14" fill="#FCD116" />
      <rect y="29" width="60" height="15" fill="#006B3F" />
      <polygon points="30,16 32.2,22.6 39,22.6 33.4,26.6 35.6,33.2 30,29 24.4,33.2 26.6,26.6 21,22.6 27.8,22.6" fill="#000" />
    </FlagSvg>
  )
}

function KenyaFlag() {
  return (
    <FlagSvg>
      <rect width="60" height="10" fill="#000" />
      <rect y="10" width="60" height="4" fill="#fff" />
      <rect y="14" width="60" height="16" fill="#BB0000" />
      <rect y="30" width="60" height="4" fill="#fff" />
      <rect y="34" width="60" height="10" fill="#006600" />
      <ellipse cx="30" cy="22" rx="7" ry="10" fill="#8B5A2B" stroke="#000" strokeWidth="1.2" />
      <ellipse cx="30" cy="22" rx="3" ry="8" fill="#BB0000" />
    </FlagSvg>
  )
}

function IvoryCoastFlag() {
  return (
    <FlagSvg>
      <rect width="20" height="44" fill="#F77F00" />
      <rect x="20" width="20" height="44" fill="#fff" />
      <rect x="40" width="20" height="44" fill="#009E60" />
    </FlagSvg>
  )
}

function SouthAfricaFlag() {
  return (
    <FlagSvg>
      <rect width="60" height="22" fill="#DE3831" />
      <rect y="22" width="60" height="22" fill="#007A4D" />
      <polygon points="0,0 28,22 0,44" fill="#000" />
      <polygon points="0,4 24,22 0,40" fill="#FFB612" />
      <polygon points="0,10 18,22 0,34" fill="#0072C6" />
      <path d="M0 0 L32 22 L0 44" fill="none" stroke="#fff" strokeWidth="5" />
    </FlagSvg>
  )
}

function UsFlag() {
  return (
    <FlagSvg>
      <rect width="60" height="44" fill="#BF0A30" />
      {[6, 13.5, 21, 28.5, 36].map((y) => (
        <rect key={y} y={y} width="60" height="4" fill="#fff" />
      ))}
      <rect width="26" height="20" fill="#002868" />
      {[6, 13].map((y) =>
        [5, 13, 21].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#fff" />),
      )}
    </FlagSvg>
  )
}

function GlobeMark() {
  return (
    <FlagSvg>
      <rect width="60" height="44" fill="#E0F2FE" />
      <circle cx="30" cy="22" r="14" fill="#38BDF8" stroke="#1B2C4F" strokeWidth="2" />
      <ellipse cx="30" cy="22" rx="6" ry="14" fill="none" stroke="#1B2C4F" strokeWidth="1.6" />
      <path d="M16 22 H44 M18 14 H42 M18 30 H42" stroke="#1B2C4F" strokeWidth="1.4" />
    </FlagSvg>
  )
}
