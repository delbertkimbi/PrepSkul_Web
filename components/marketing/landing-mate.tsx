"use client"

import { useEffect, useRef, useState } from "react"
import { PrepMate } from "@/components/onboard/prep-mate"
import type { MascotState } from "@/lib/mascot-states"

const SEQUENCES: Record<string, readonly MascotState[]> = {
  welcome: ["wave", "idle", "idle", "happy", "idle"],
  learn: ["reading", "reading", "studying", "studying", "idea"],
  celebrate: ["celebrate", "idle", "thumbs_up", "idle", "happy"],
}

/** One persistent 3D viewer; transitions change clips without remounting it. */
export function LandingMate({ scene, size, locale, priority = false }: {
  scene: "welcome" | "learn" | "celebrate"
  size: number
  locale: string
  priority?: boolean
}) {
  const host = useRef<HTMLButtonElement>(null)
  const [pose, setPose] = useState<MascotState>(SEQUENCES[scene][0])
  const [running, setRunning] = useState(false)
  const [reaction, setReaction] = useState(0)
  useEffect(() => {
    const element = host.current
    if (!element) return
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    let visible = false
    let timer: ReturnType<typeof setInterval> | undefined
    let index = 0
    const sync = () => {
      clearInterval(timer)
      const active = visible && !document.hidden && !reduced.matches
      setRunning(active)
      if (reduced.matches) { setPose(scene === "learn" ? "reading" : "idle"); return }
      if (!active) return
      setPose(reaction ? "happy" : SEQUENCES[scene][index])
      timer = setInterval(() => {
        index = (index + 1) % SEQUENCES[scene].length
        setPose(SEQUENCES[scene][index])
      }, 4200)
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      sync()
    }, { threshold: .25 })
    observer.observe(element)
    reduced.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      clearInterval(timer); observer.disconnect()
      reduced.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [scene, reaction])
  const fr = locale.startsWith("fr")
  return <button ref={host} type="button"
    aria-label={fr ? "Dire bonjour à Mate" : "Say hello to Mate"}
    onClick={() => setReaction(value => value + 1)}
    className={`ps-landing-mate ${scene === "welcome" ? "" : "ps-landing-mate--orbit"}`}
    data-running={running} data-scene={scene}
    style={{ width: size, height: size }}>
    {scene !== "welcome" && <span className="ps-mate-orbit" aria-hidden><i /><i /><i /></span>}
    <PrepMate state={pose} size={size} priority={priority} />
  </button>
}
