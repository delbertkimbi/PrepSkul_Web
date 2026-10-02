export function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`ps-laurel${flip ? " ps-laurel-flip" : ""}`}
      viewBox="0 0 28 52"
      aria-hidden
    >
      <g fill="none" stroke="#1B2C4F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 50c-8-8-14-18-12-32 1-8 6-14 12-16" />
      </g>
      <g fill="#1B2C4F">
        <path d="M16 8c-4-1-8 2-8 6 4 0 8-2 10-5-1-1-1-1-2-1Z" />
        <path d="M12 16c-5 0-8 4-7 8 4-1 8-3 10-6-1-1-2-2-3-2Z" />
        <path d="M10 26c-5 1-7 6-5 9 4-2 8-4 10-7-2-1-3-2-5-2Z" />
        <path d="M11 36c-4 2-6 7-3 10 3-2 7-5 8-8-2 0-3-1-5-2Z" />
        <path d="M14 44c-3 2-4 6-1 8 2-2 5-4 6-6-2 0-3-1-5-2Z" />
      </g>
    </svg>
  )
}

export function MatePoint() {
  return (
    <svg className="ps-mate-point" viewBox="0 0 128 148" aria-hidden>
      <ellipse className="ps-mate-shadow" cx="58" cy="140" rx="30" ry="6" fill="rgba(27,44,79,.18)" />
      <g className="ps-mate-hop">
        <line x1="58" y1="30" x2="62" y2="8" stroke="#1B2C4F" strokeWidth="5" strokeLinecap="round" />
        <circle cx="64" cy="8" r="8" fill="#EAB308" />
        <ellipse cx="58" cy="82" rx="40" ry="50" fill="#4A6FBF" />
        <ellipse cx="58" cy="100" rx="26" ry="22" fill="#0EA5E9" />
        <g className="ps-mate-blink">
          <ellipse cx="44" cy="70" rx="10" ry="12" fill="#fff" />
          <ellipse cx="72" cy="70" rx="10" ry="12" fill="#fff" />
          <circle cx="46" cy="73" r="4.2" fill="#1B2C4F" />
          <circle cx="74" cy="73" r="4.2" fill="#1B2C4F" />
        </g>
        <path d="M46 90c6 8 18 8 24 0" fill="none" stroke="#1B2C4F" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M22 86c-10-4-16-16-10-24" fill="none" stroke="#1B2C4F" strokeWidth="7" strokeLinecap="round" />
        <circle cx="12" cy="62" r="5.5" fill="#1B2C4F" />
        <g className="ps-mate-arm">
          <path d="M94 86c14-4 26-10 32-12" fill="none" stroke="#1B2C4F" strokeWidth="7" strokeLinecap="round" />
          <circle cx="126" cy="72" r="5.5" fill="#1B2C4F" />
        </g>
        <ellipse cx="44" cy="128" rx="11" ry="7" fill="#1B2C4F" />
        <ellipse cx="72" cy="128" rx="11" ry="7" fill="#1B2C4F" />
      </g>
    </svg>
  )
}
