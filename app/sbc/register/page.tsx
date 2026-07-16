"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, MapPin, MessageCircle, UserRound, Users } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Eyebrow, PaperButton, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SBC_CONTACT, SBC_PACKAGES, type SbcPackageId } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { useSbcLanguage } from "@/lib/sbc/i18n"

type RegistrantType = "parent" | "participant"
type Form = { name: string; phone: string; email: string; childCount: string; children: string; age: string; mode: "onsite" | "online"; city: string }
const initial: Form = { name: "", phone: "", email: "", childCount: "1", children: "", age: "", mode: "onsite", city: "" }

export default function RegisterPage() {
  const path = useSbcPath()
  const { locale, t } = useSbcLanguage()
  const [registrantType, setRegistrantType] = useState<RegistrantType>("parent")
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [sent, setSent] = useState(false)
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState("")
  const [packageId, setPackageId] = useState<SbcPackageId>("explorer")

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("package")
    if (SBC_PACKAGES.some((pkg) => pkg.id === requested)) setPackageId(requested as SbcPackageId)
  }, [])

  const isParent = registrantType === "parent"
  const count = isParent ? Math.max(1, Number(form.childCount) || 1) : 1
  const selectedPackage = SBC_PACKAGES.find((pkg) => pkg.id === packageId) ?? SBC_PACKAGES[0]
  const priceEach = count > 1 ? selectedPackage.familyPrice : selectedPackage.price
  const total = priceEach * count

  const message = () => locale === "fr" ? [
    "Bonjour PrepSkul ! Je souhaite m’inscrire au Summer Build Camp 2026.", "",
    `*Type d’inscription :* ${isParent ? "Parent / Tuteur" : "Participant"}`,
    `*Forfait :* ${selectedPackage.name}`,
    `*Nom :* ${form.name}`, `*Téléphone :* ${form.phone}`,
    form.email && `*E-mail :* ${form.email}`,
    isParent && `*Nombre d’enfants :* ${count}`,
    isParent ? `*Enfants (noms et âges) :* ${form.children}` : `*Âge du participant :* ${form.age}`,
    `*Participation :* ${form.mode === "onsite" ? "En présentiel à Buea" : "En ligne"}`,
    `*Ville :* ${form.city}`, "", `*Total de l’inscription :* ${total.toLocaleString("fr-FR")} XAF`,
  ].filter(Boolean).join("\n") : [
    "Hello PrepSkul! I would like to register for Summer Build Camp 2026.", "",
    `*Registration type:* ${isParent ? "Parent / Guardian" : "Participant"}`,
    `*Package:* ${selectedPackage.name}`,
    `*Name:* ${form.name}`, `*Phone:* ${form.phone}`,
    form.email && `*Email:* ${form.email}`,
    isParent && `*Number of children:* ${count}`,
    isParent ? `*Children (names and ages):* ${form.children}` : `*Participant age:* ${form.age}`,
    `*Participation:* ${form.mode === "onsite" ? "Onsite in Buea" : "Online"}`,
    `*City:* ${form.city}`, "", `*Registration total:* ${total.toLocaleString()} XAF`,
  ].filter(Boolean).join("\n")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = t(isParent ? "Parent or guardian name is required" : "Your name is required")
    if (!form.phone.trim()) next.phone = t("Phone number is required")
    if (isParent && !form.children.trim()) next.children = t("Add each child’s name and age")
    if (!isParent && !form.age.trim()) next.age = t("Your age is required")
    if (!isParent && form.age.trim() && (Number(form.age) < 9 || Number(form.age) > 18)) next.age = t("Age must be between 9 and 18")
    if (!form.city.trim()) next.city = t("City is required")
    if (!consent) setConsentError(t("Your consent is required before continuing"))
    else setConsentError("")
    setErrors(next)
    if (Object.keys(next).length || !consent) return
    setSent(true)
    window.open(`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener,noreferrer")
  }

  const updateType = (type: RegistrantType) => {
    setRegistrantType(type)
    setErrors({})
    setConsent(false)
    setConsentError("")
  }

  const field = (key: "name" | "phone" | "email" | "city" | "age", label: string, placeholder: string, type = "text") => <div className="space-y-2"><Label htmlFor={key} className="font-bold text-[#132d63]">{t(label)}</Label><Input id={key} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={t(placeholder)} className="sbc-field"/>{errors[key] && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3"/>{errors[key]}</p>}</div>

  if (sent) return <SbcPageShell><SbcHeader/><main className="flex flex-1 items-center justify-center px-4 py-20"><PaperSheet className="max-w-xl p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto h-14 w-14 text-[#168c91]"/><h1 className="sbc-display mt-5 text-4xl font-black uppercase">{t("Almost there!")}</h1><p className="mt-4 leading-7 text-slate-600">{t("WhatsApp has opened with your details. Send that message to our team to confirm availability and payment.")}</p><a className="mt-7 inline-block" href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message())}`} target="_blank" rel="noreferrer"><PaperButton><MessageCircle className="mr-2 h-5 w-5"/>{t("Continue to WhatsApp")}</PaperButton></a><div><Link href={path()} className="mt-6 inline-block text-sm font-bold text-[#2864d7]">{t("Back to SBC")}</Link></div></PaperSheet></main><SbcFooter/></SbcPageShell>

  return <SbcPageShell><SbcHeader/><main className="px-4 py-12 sm:px-6 lg:py-20"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_370px]">
    <div><Eyebrow>{t("Registration is open")}</Eyebrow><h1 className="sbc-display mt-5 text-5xl font-black uppercase leading-none sm:text-7xl">{t(isParent ? "Save their seat." : "Save your seat.")}</h1><p className="mt-5 max-w-2xl leading-7 text-slate-600">{t("Tell us who is joining. After this short form, we’ll prepare a WhatsApp message so our team can confirm the registration with you.")}</p>
      <PaperSheet className="mt-9 p-5 min-[375px]:p-6 sm:p-8"><Tape className="-top-3 left-1/2 -translate-x-1/2"/><form onSubmit={submit} className="space-y-6">
        <fieldset className="space-y-3"><legend className="font-bold text-[#132d63]">{t("I’m registering as")}</legend><div className="grid grid-cols-2 gap-3">{([{ value: "parent", label: "Parent / Guardian", icon: Users }, { value: "participant", label: "Participant", icon: UserRound }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => updateType(value)} aria-pressed={registrantType === value} className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${registrantType === value ? "border-[#132d63] bg-[#dfeeff] text-[#132d63] shadow-[0_4px_0_#132d63]" : "border-[#132d63]/15 bg-white text-slate-500 hover:border-[#2864d7]"}`}><Icon className="h-5 w-5"/>{t(label)}</button>)}</div></fieldset>
        <div className="grid gap-5 sm:grid-cols-2">{field("name", isParent ? "Parent / guardian name *" : "Your full name *", isParent ? "e.g. Grace N." : "e.g. Amina N.")}{field("phone", "WhatsApp phone *", "e.g. 653 30 19 97", "tel")}</div>
        <div className="grid gap-5 sm:grid-cols-2">{field("email", "Email (optional)", "you@example.com", "email")}{field("city", "City *", "e.g. Buea")}</div>
        <fieldset className="space-y-3"><legend className="font-bold text-[#132d63]">{t("Choose a package *")}</legend><p className="-mt-1 text-xs leading-5 text-slate-500">{t("Every package includes the complete 5-day camp. Choose the post-camp support that fits your child.")}</p><div className="grid gap-3 sm:grid-cols-3">{SBC_PACKAGES.map((pkg) => <button key={pkg.id} type="button" onClick={() => setPackageId(pkg.id)} aria-pressed={packageId === pkg.id} className={`rounded-2xl border-2 p-4 text-left transition ${packageId === pkg.id ? "border-[#132d63] bg-[#dfeeff] shadow-[0_4px_0_#132d63]" : "border-[#132d63]/15 bg-white hover:border-[#2864d7]"}`}><span className="block font-black text-[#132d63]">{t(pkg.name)}</span><span className="mt-1 block text-xs font-bold text-[#168c91]">{pkg.price.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} XAF</span><span className="mt-2 block text-[11px] leading-4 text-slate-500">{t(pkg.tagline)}</span></button>)}</div><Link href={path("/pricing")} className="inline-block text-xs font-bold text-[#2864d7] underline decoration-[#f5c843] decoration-2 underline-offset-4">{t("Compare all packages")}</Link></fieldset>
        {isParent ? <div className="space-y-3"><Label className="font-bold">{t("Number of children *")}</Label><div className="grid grid-cols-6 gap-2" role="group" aria-label={t("Number of children *")}>{[1,2,3,4,5,6].map((number) => <button key={number} type="button" onClick={() => setForm({ ...form, childCount: String(number) })} aria-pressed={count === number} className={`aspect-square rounded-xl border-2 text-sm font-black transition ${count === number ? "border-[#132d63] bg-[#f5c843] text-[#132d63] shadow-[0_3px_0_#132d63]" : "border-[#2864d7]/20 bg-[#eaf3ff] text-[#2864d7] hover:border-[#2864d7]"}`}>{number}</button>)}</div></div> : field("age", "Your age *", "e.g. 15", "number")}
        <div className="space-y-3"><Label className="font-bold">{t("Participation *")}</Label><div className="grid grid-cols-2 gap-3">{(["onsite", "online"] as const).map((mode) => <button key={mode} type="button" onClick={() => setForm({ ...form, mode })} aria-pressed={form.mode === mode} className={`rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${form.mode === mode ? "border-[#168c91] bg-[#dff5ef] text-[#132d63] shadow-[0_3px_0_#168c91]" : "border-[#132d63]/15 bg-white text-slate-500"}`}>{t(mode === "onsite" ? "Onsite in Buea" : "Online")}</button>)}</div></div>
        {isParent && <div className="space-y-2"><Label htmlFor="children" className="font-bold">{t("Child name(s) and age(s) *")}</Label><Textarea id="children" value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })} placeholder={count > 1 ? "e.g. Amina — 12\nJoel — 9" : "e.g. Amina — 12"} className="min-h-28 rounded-2xl bg-white/80"/>{errors.children && <p className="text-xs text-red-600">{errors.children}</p>}</div>}
        <div className="rounded-2xl border border-[#132d63]/15 bg-[#eaf3ff]/70 p-4"><label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600"><input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError("") }} className="mt-1 h-4 w-4 shrink-0 accent-[#1e3a8a]"/><span>{t(isParent ? "I am the parent or authorized guardian of the child or children named above. I consent to PrepSkul and the SBC team using these details solely to process this registration and contact me about the program." : "I confirm that my parent or guardian knows about this registration. I consent to PrepSkul and the SBC team using my details solely to process it and contact me about the program.")} {t("I have read the")} <a href={`https://prepskul.com/${locale}/privacy-policy`} target="_blank" rel="noreferrer" className="font-bold text-[#2864d7] underline">{t("Privacy Policy")}</a>.</span></label>{consentError && <p className="mt-2 text-xs font-semibold text-red-600">{consentError}</p>}</div>
        <button type="submit" className="w-full"><PaperButton className="w-full">{t("Continue to WhatsApp")} <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></button><p className="text-center text-xs leading-5 text-slate-500">{t("Submitting this form does not make a payment. Our team will confirm the next step in WhatsApp.")}</p>
      </form></PaperSheet>
    </div>
    <aside className="lg:pt-20"><PaperSheet tone="yellow" className="p-7 lg:sticky lg:top-28" rotate={2}><Tape color="cream" className="-right-4 -top-3 rotate-12"/><p className="text-xs font-black uppercase tracking-widest">{t("Your SBC note")}</p><div className="mt-4 rounded-xl bg-white/55 p-3"><b className="block text-lg text-[#132d63]">{t(selectedPackage.name)}</b><span className="text-xs font-bold text-[#168c91]">{t(selectedPackage.tagline)}</span></div><div className="mt-6 space-y-5 text-sm"><p className="flex gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-[#2864d7]"/><span><b className="block">4–8 {t("August")} 2026</b>{t("Tuesday to Saturday")}</span></p><p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-[#168c91]"/><span><b className="block">{t("Buea + online")}</b>{t("Ages 9–18")}</span></p><p className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-[#6a47bd]"/><span><b className="block">{isParent ? `${count} ${t(count === 1 ? "child" : "children")}` : `1 ${t("participant")}`}</b>{priceEach.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} XAF {t("per child")}</span></p></div><div className="mt-7 border-t-2 border-dashed border-[#132d63]/20 pt-5"><span className="text-xs font-bold uppercase">{t("Registration total")}</span><strong className="block text-4xl font-black">{total.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} <small className="text-base">XAF</small></strong>{count > 1 && <p className="mt-2 text-xs font-bold text-[#168c91]">{t("Family price applied")}</p>}</div></PaperSheet></aside>
  </div></main><SbcFooter/></SbcPageShell>
}
