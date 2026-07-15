"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { useSbcLanguage } from "@/lib/sbc/i18n"

const START = new Date("2026-08-04T00:00:00+01:00").getTime()
const END = new Date("2026-08-08T23:59:59+01:00").getTime()

function remaining() {
  const delta = Math.max(0, START - Date.now())
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta / 3_600_000) % 24),
    minutes: Math.floor((delta / 60_000) % 60),
    seconds: Math.floor((delta / 1_000) % 60),
  }
}

export function CountdownStrip() {
  const [time, setTime] = useState(remaining)
  const [now, setNow] = useState(() => Date.now())
  const path = useSbcPath()
  const { t } = useSbcLanguage()

  useEffect(() => {
    const tick = window.setInterval(() => {
      setNow(Date.now())
      setTime(remaining())
    }, 1000)
    return () => window.clearInterval(tick)
  }, [])

  const units = [
    [t("Days"), time.days],
    [t("Hours"), time.hours],
    [t("Minutes"), time.minutes],
    [t("Seconds"), time.seconds],
  ] as const

  const phase = now < START ? "countdown" : now <= END ? "live" : "complete"

  return (
    <section aria-label={t("Countdown to Summer Build Camp")} className="relative z-20 px-4 pb-10 sm:px-6 lg:pb-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[26px] border-2 border-[#132d63] bg-[#f5c843] px-4 py-5 shadow-[0_8px_0_#132d63] sm:px-7">
          <Sparkles aria-hidden className="absolute -right-2 -top-2 h-16 w-16 rotate-12 text-white/45" />
          {phase === "countdown" ? <div className="relative flex flex-col items-center gap-5 lg:flex-row lg:justify-between lg:gap-10">
            <div className="shrink-0 text-center lg:text-left">
              <h2 className="sbc-display text-2xl font-black uppercase leading-none text-[#132d63] sm:text-3xl lg:text-[2.1rem]">{t("Ready. Set. Innovate!")}</h2>
            </div>
            <div className="grid w-full max-w-3xl grid-cols-4">
              {units.map(([label, value], index) => (
                <div key={label} className="relative px-1 text-center text-[#132d63] sm:px-4">
                  <strong suppressHydrationWarning className="sbc-display block text-4xl font-black leading-none tabular-nums sm:text-6xl lg:text-7xl">{String(value).padStart(2, "0")}</strong>
                  <span className="mt-2 block text-[8px] font-black uppercase tracking-[.14em] sm:text-[11px]">{label}</span>
                  {index < units.length - 1 && <span aria-hidden className="absolute -right-1 top-3 text-2xl font-black text-[#168c91] sm:top-5 sm:text-4xl">:</span>}
                </div>
              ))}
            </div>
          </div> : phase === "live" ? <div className="relative flex items-center justify-center gap-4 py-2 text-center"><span className="h-4 w-4 animate-pulse rounded-full bg-[#168c91] ring-8 ring-[#168c91]/20"/><h2 className="sbc-display text-4xl font-black uppercase leading-none text-[#132d63] sm:text-6xl">{t("SBC is live!")}</h2></div> : <div className="relative flex flex-col items-center justify-between gap-4 py-1 text-center sm:flex-row sm:text-left"><h2 className="sbc-display text-3xl font-black uppercase leading-none text-[#132d63] sm:text-5xl">{t("Ready for the next build?")}</h2><Link href={path("/register")} className="rounded-2xl bg-[#132d63] px-6 py-3 font-black text-white shadow-[0_5px_0_#168c91] transition hover:-translate-y-1">{t("Join the next cohort")}</Link></div>}
        </div>
      </div>
    </section>
  )
}
