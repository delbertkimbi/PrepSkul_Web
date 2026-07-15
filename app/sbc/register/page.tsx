"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, MapPin, MessageCircle, Users } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Eyebrow, PaperButton, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SBC_CONTACT, SBC_PRICING } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"

type Form = { parent: string; phone: string; email: string; childCount: string; children: string; mode: string; city: string }
const initial: Form = { parent:"", phone:"", email:"", childCount:"1", children:"", mode:"onsite", city:"" }

export default function RegisterPage() {
  const path = useSbcPath()
  const [form,setForm] = useState(initial)
  const [errors,setErrors] = useState<Partial<Record<keyof Form,string>>>({})
  const [sent,setSent] = useState(false)
  const [consent,setConsent] = useState(false)
  const [consentError,setConsentError] = useState("")
  const count = Math.max(1, Number(form.childCount) || 1)
  const priceEach = count > 1 ? SBC_PRICING.siblingFee : SBC_PRICING.registrationFee
  const total = priceEach * count

  const message = () => [
    "Hello PrepSkul! I would like to register for Summer Build Camp 2026.", "",
    `*Parent/Guardian:* ${form.parent}`, `*Phone:* ${form.phone}`,
    form.email && `*Email:* ${form.email}`, `*Number of children:* ${count}`,
    `*Children (names and ages):* ${form.children}`, `*Participation:* ${form.mode === "onsite" ? "Onsite in Buea" : "Online"}`,
    `*City:* ${form.city}`, "", `*Registration total:* ${total.toLocaleString()} XAF (${priceEach.toLocaleString()} XAF per child)`
  ].filter(Boolean).join("\n")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.parent.trim()) next.parent = "Parent or guardian name is required"
    if (!form.phone.trim()) next.phone = "Phone number is required"
    if (!form.children.trim()) next.children = "Add each child’s name and age"
    if (!form.city.trim()) next.city = "City is required"
    if (!consent) setConsentError("Your consent is required before continuing")
    else setConsentError("")
    setErrors(next)
    if (Object.keys(next).length || !consent) return
    setSent(true)
    window.open(`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener,noreferrer")
  }

  if (sent) return <SbcPageShell><SbcHeader/><main className="flex flex-1 items-center justify-center px-4 py-20"><PaperSheet className="max-w-xl p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto h-14 w-14 text-[#168c91]"/><h1 className="sbc-display mt-5 text-4xl font-black uppercase">Almost there!</h1><p className="mt-4 leading-7 text-slate-600">WhatsApp has opened with your details. Send that message to our team to confirm availability and payment.</p><a className="mt-7 inline-block" href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message())}`} target="_blank" rel="noreferrer"><PaperButton><MessageCircle className="mr-2 h-5 w-5"/>Continue on WhatsApp</PaperButton></a><div><Link href={path()} className="mt-6 inline-block text-sm font-bold text-[#2864d7]">Back to SBC</Link></div></PaperSheet></main><SbcFooter/></SbcPageShell>

  const field = (key: keyof Form, label: string, placeholder: string, type="text") => <div className="space-y-2"><Label htmlFor={key} className="font-bold text-[#132d63]">{label}</Label><Input id={key} type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} className="sbc-field"/>{errors[key]&&<p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3"/>{errors[key]}</p>}</div>

  return <SbcPageShell><SbcHeader/><main className="px-4 py-12 sm:px-6 lg:py-20"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_370px]">
    <div><Eyebrow>Registration is open</Eyebrow><h1 className="sbc-display mt-5 text-5xl font-black uppercase leading-none sm:text-7xl">Save their <span className="text-[#2864d7]">seat.</span></h1><p className="mt-5 max-w-2xl leading-7 text-slate-600">Tell us who is joining. After this short form, we’ll prepare a WhatsApp message so our team can confirm the registration with you.</p>
      <PaperSheet className="mt-9 p-5 min-[375px]:p-6 sm:p-8"><Tape className="-top-3 left-1/2 -translate-x-1/2"/><form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2">{field("parent","Parent / guardian name *","e.g. Grace N.")}{field("phone","WhatsApp phone *","e.g. 653 30 19 97","tel")}</div><div className="grid gap-5 sm:grid-cols-2">{field("email","Email (optional)","you@example.com","email")}{field("city","City *","e.g. Buea")}</div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="childCount" className="font-bold">Number of children *</Label><select id="childCount" value={form.childCount} onChange={e=>setForm({...form,childCount:e.target.value})} className="sbc-field w-full px-3">{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></div><div className="space-y-2"><Label htmlFor="mode" className="font-bold">Participation *</Label><select id="mode" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})} className="sbc-field w-full px-3"><option value="onsite">Onsite in Buea</option><option value="online">Online</option></select></div></div><div className="space-y-2"><Label htmlFor="children" className="font-bold">Child name(s) and age(s) *</Label><Textarea id="children" value={form.children} onChange={e=>setForm({...form,children:e.target.value})} placeholder={count>1?"e.g. Amina — 12\nJoel — 9":"e.g. Amina — 12"} className="min-h-28 rounded-2xl bg-white/80"/>{errors.children&&<p className="text-xs text-red-600">{errors.children}</p>}</div><div className="rounded-2xl border border-[#132d63]/15 bg-[#eaf3ff]/70 p-4"><label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600"><input type="checkbox" checked={consent} onChange={e=>{setConsent(e.target.checked);if(e.target.checked)setConsentError("")}} className="mt-1 h-4 w-4 shrink-0 accent-[#1e3a8a]"/><span>I am the parent or authorized guardian of the child or children named above. I consent to PrepSkul and the SBC team using these details solely to process this registration and contact me about the program. I have read the <a href="https://prepskul.com/en/privacy-policy" target="_blank" rel="noreferrer" className="font-bold text-[#2864d7] underline">Privacy Policy</a>.</span></label>{consentError&&<p className="mt-2 text-xs font-semibold text-red-600">{consentError}</p>}</div><button type="submit" className="w-full"><PaperButton className="w-full">Continue to WhatsApp <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></button><p className="text-center text-xs leading-5 text-slate-500">Submitting this form does not make a payment. Our team will confirm the next step in WhatsApp.</p></form></PaperSheet>
    </div>
    <aside className="lg:pt-20"><PaperSheet tone="yellow" className="p-7 lg:sticky lg:top-28" rotate={2}><Tape color="cream" className="-right-4 -top-3 rotate-12"/><p className="text-xs font-black uppercase tracking-widest">Your SBC note</p><div className="mt-6 space-y-5 text-sm"><p className="flex gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-[#2864d7]"/><span><b className="block">4–8 August 2026</b>Tuesday to Saturday</span></p><p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-[#168c91]"/><span><b className="block">Buea + online</b>Ages 9–18</span></p><p className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-[#6a47bd]"/><span><b className="block">{count} {count===1?"child":"children"}</b>{priceEach.toLocaleString()} XAF per child</span></p></div><div className="mt-7 border-t-2 border-dashed border-[#132d63]/20 pt-5"><span className="text-xs font-bold uppercase">Registration total</span><strong className="block text-4xl font-black">{total.toLocaleString()} <small className="text-base">XAF</small></strong>{count>1&&<p className="mt-2 text-xs font-bold text-[#168c91]">Sibling/group rate applied</p>}</div></PaperSheet></aside>
  </div></main><SbcFooter/></SbcPageShell>
}
