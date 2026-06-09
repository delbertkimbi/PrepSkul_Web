"use client"

import { useSyncExternalStore } from "react"

function getBasePath(): string {
  if (typeof window === "undefined") return "/sbc"
  const host = window.location.hostname
  return host.startsWith("sbc.") || host.startsWith("sbc.localhost") ? "" : "/sbc"
}

function subscribe() {
  return () => {}
}

export function useSbcPath() {
  const base = useSyncExternalStore(subscribe, getBasePath, () => "/sbc")

  return (path: string = "") => {
    if (!path) return base || "/"
    if (path.startsWith("#")) return `${base || "/"}${path}`
    const normalized = path.startsWith("/") ? path : `/${path}`
    return `${base}${normalized}`
  }
}
