"use client"

import { type MascotState } from "@/lib/mascot-states"
import { SkulMate3D } from "@/components/onboard/skulmate-3d"

export type PrepMateMood = "idle" | "wave" | "talk" | "think" | "cheer" | "encourage"

/** Shared 3D illustration set, also bundled in the Flutter app. */
export function PrepMate({
  mood = "idle", size = 168, state, priority = false,
}: {
  mood?: PrepMateMood
  state?: MascotState
  size?: number
  priority?: boolean
  variant?: "hero" | "ask"
  onDarkBackground?: boolean
}) {
  const pose: MascotState = state ?? (mood === "think" ? "thinking" : mood === "cheer" ? "celebrate" : mood === "talk" ? "teaching" : mood)
  return (
    <span className={`ps-mate-3d ps-mate-3d--${mood}`} style={{ width: size, height: size }} aria-hidden>
      <SkulMate3D state={mood === "talk" ? "talk" : pose} size={size} priority={priority} />
    </span>
  )
}
