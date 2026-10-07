"use client"

import { createElement, useEffect, useRef, useState } from "react"
import type { MascotState } from "@/lib/mascot-states"

type Viewer = HTMLElement & {
  availableAnimations: string[]; animationName: string; currentTime: number
  timeScale: number; play: () => void; pause: () => void; loaded: boolean
}
let loader: Promise<void> | null = null
function loadViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve()
  if (!loader) loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.type = "module"
    script.src = "/vendor/model-viewer-4.3.1.min.js"
    script.onload = () => { customElements.whenDefined("model-viewer").then(() => resolve()) }
    script.onerror = () => { loader = null; script.remove(); reject(new Error("3D viewer unavailable")) }
    document.head.appendChild(script)
  })
  return loader
}

export function SkulMate3D({ state = "idle", size = 168, className = "" }: {
  state?: MascotState | "talk"; size?: number; className?: string
}) {
  const host = useRef<Viewer | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const desired = useRef(state)
  desired.current = state
  useEffect(() => {
    const viewer = host.current
    if (!viewer) return
    let alive = true
    let visible = false
    let started = false
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const playback = () => {
      if (!viewer.loaded) return
      viewer.timeScale = desired.current === "talk" ? 1.35 : desired.current === "idle" ? 0.82 : 1.12
      if (visible && !document.hidden && !reduced.matches) viewer.play()
      else viewer.pause()
      viewer.dataset.playing = String(visible && !document.hidden && !reduced.matches)
    }
    const onLoad = () => {
      const name = desired.current === "teaching" ? "explaining" : desired.current === "calm" ? "meditation" : desired.current
      viewer.animationName = viewer.availableAnimations.find(clip => clip.replace(/^\d+_/, "") === name) ?? viewer.availableAnimations[0]
      viewer.currentTime = 0
      viewer.dataset.clip = viewer.animationName
      viewer.dataset.ready = "true"
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!alive) return
        setLoaded(true); setError(false); playback()
      }))
    }
    const onError = () => { setError(true); setLoaded(false) }
    viewer.addEventListener("load", onLoad); viewer.addEventListener("error", onError)
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      if (visible && !started) {
        started = true
        loadViewer().then(() => { if (alive && viewer.loaded) onLoad() }).catch(() => { if (alive) onError() })
      }
      playback()
    }, { rootMargin: "120px" })
    observer.observe(viewer)
    document.addEventListener("visibilitychange", playback); reduced.addEventListener("change", playback)
    return () => {
      alive = false; observer.disconnect(); viewer.pause?.()
      viewer.removeEventListener("load", onLoad); viewer.removeEventListener("error", onError)
      document.removeEventListener("visibilitychange", playback); reduced.removeEventListener("change", playback)
    }
  }, [attempt])
  useEffect(() => {
    const viewer = host.current
    if (!loaded || !viewer) return
    const name = state === "teaching" ? "explaining" : state === "calm" ? "meditation" : state
    viewer.timeScale = state === "talk" ? 1.35 : state === "idle" ? 0.82 : 1.12
    const clip = viewer.availableAnimations.find(item => item.replace(/^\d+_/, "") === name)
    if (clip && viewer.animationName !== clip) { viewer.animationName = clip; viewer.currentTime = 0; viewer.dataset.clip = clip }
  }, [state, loaded])
  return <span className={className} style={{ display: "inline-block", position: "relative", width: size, height: size }}>
    {createElement("model-viewer", {
      key: attempt, ref: host, src: "/3d/skulmate.glb?v=satin-3", alt: "Mate, your learning companion", loading: "lazy",
      "camera-orbit": "0deg 85deg 7m", "camera-target": "0m 1.7m 0m", "field-of-view": "30deg",
      "interaction-prompt": "none", "shadow-intensity": size < 128 ? "0" : "0.35", exposure: "1",
      "animation-crossfade-duration": state === "talk" || state === "idle" ? "80" : "220",
      className: "ps-mate-viewer",
      style: { width: "100%", height: "100%", background: "transparent", pointerEvents: "none", opacity: loaded ? 1 : 0, transition: "opacity 160ms ease-out" },
    })}
    {error && <button type="button" onClick={() => { setError(false); setAttempt(v => v + 1) }} className="absolute inset-0 rounded-2xl text-xs text-slate-600">Reload Mate</button>}
  </span>
}
