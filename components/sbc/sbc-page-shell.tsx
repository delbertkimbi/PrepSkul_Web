"use client"

import { Children, cloneElement, isValidElement } from "react"
import { useSbcLanguage } from "@/lib/sbc/i18n"

function translateNode(node: React.ReactNode, t: (text: string) => string): React.ReactNode {
  if (typeof node === "string") return t(node)
  if (Array.isArray(node)) return node.map((child) => translateNode(child, t))
  if (!isValidElement(node)) return node

  const props = node.props as Record<string, unknown>
  const translatedProps: Record<string, unknown> = {}
  for (const key of ["placeholder", "aria-label", "title", "alt"]) {
    if (typeof props[key] === "string") translatedProps[key] = t(props[key] as string)
  }
  if ("children" in props) {
    translatedProps.children = Children.map(props.children as React.ReactNode, (child) => translateNode(child, t))
  }
  return cloneElement(node, translatedProps)
}

export function SbcPageShell({ children }: { children: React.ReactNode }) {
  const { t } = useSbcLanguage()
  return (
    <div className="sbc-site min-h-screen flex flex-col bg-[#FAF8F3] text-[#132d63] overflow-x-hidden">
      <div className="relative flex flex-col min-h-screen">{translateNode(children, t)}</div>
    </div>
  )
}
