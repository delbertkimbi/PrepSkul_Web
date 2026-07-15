"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { PaperButton } from "@/components/sbc/paper-ui"

export default function SbcHeader() {
  const [open,setOpen] = useState(false)
  const path = useSbcPath()
  const links = [{label:"About",href:path("/about")},{label:"Roadmap",href:path("/program")},{label:"What you’ll build",href:path("#build")},{label:"FAQ",href:path("/faq")}]
  return <header className="sticky top-0 z-50 border-b border-[#132d63]/10 bg-[#faf8f3]/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6"><Link href={path()} aria-label="Summer Build Camp home" className="relative flex h-14 w-32 items-center overflow-hidden sm:w-36"><Image src="/sbclogo.png" alt="Summer Build Camp" width={554} height={451} priority className="h-24 w-32 scale-[1.45] object-contain sm:w-36"/></Link><nav className="hidden items-center gap-6 md:flex">{links.map(l=><Link key={l.label} href={l.href} className="text-sm font-bold text-[#132d63] transition hover:-rotate-1 hover:text-[#2864d7]">{l.label}</Link>)}<Link href={path("/register")}><PaperButton className="px-5 py-2.5 text-sm shadow-[0_5px_0_#12295f]">Register now</PaperButton></Link></nav><button onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="sbc-menu" aria-label="Toggle navigation" className="rounded-xl border border-[#132d63]/15 bg-white p-2 md:hidden">{open?<X/>:<Menu/>}</button></div>{open&&<nav id="sbc-menu" className="border-t border-[#132d63]/10 px-4 pb-5 pt-3 md:hidden">{links.map(l=><Link onClick={()=>setOpen(false)} key={l.label} href={l.href} className="block rounded-xl px-3 py-3 font-bold">{l.label}</Link>)}<Link onClick={()=>setOpen(false)} href={path("/register")} className="mt-2 block rounded-xl bg-[#1e3a8a] px-4 py-3 text-center font-black text-white">Register now</Link></nav>}</header>
}
