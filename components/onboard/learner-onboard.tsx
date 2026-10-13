"use client"

import { Children, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import localFont from "next/font/local"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Volume2 } from "lucide-react"
import {
  REGION_PACKS,
  packById,
  subjectOptionsFor,
  systemById,
  t,
  type RegionPack,
} from "@/lib/skulmate/region-packs"
import { PrepMate, type PrepMateMood } from "@/components/onboard/prep-mate"
import { Glyph } from "@/components/onboard/glyphs"
import { prefetchMateLine, speakMateLine, speakMateText, stopMateVoice, unlockMateVoice } from "@/components/onboard/mate-voice"
import { mateVoiceText, type MateVoicePhrase } from "@/lib/skulmate/mate-voice-lines"
import { APP_ORIGIN } from "@/lib/get-started-url"

const display = localFont({
  src: "../../public/fonts/Fredoka.ttf",
  weight: "300 700",
  display: "swap",
})

const nunito = localFont({
  src: [
    { path: "../../public/fonts/Nunito-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Nunito-SemiBold.ttf", weight: "500 600" },
    { path: "../../public/fonts/Nunito-Bold.ttf", weight: "700 900" },
  ],
  display: "swap",
})

/** PrepSkul + SBC paper: deep blue ink, sky progress, yellow accent. */
const NAVY = "#1B2C4F"
const NAVY_SHADOW = "#0F1A2E"
const SKY = "#0EA5E9"
const YELLOW = "#EAB308"
const PAPER = "#FAF8F3"
const EASE = [0.22, 1, 0.36, 1] as const

type Answers = {
  locale: "en" | "fr"
  role: "learner" | "parent"
  name: string
  countryId: string
  countryOther?: string
  cityId?: string
  cityOther?: string
  systemId?: string
  levelId?: string
  subjectId?: string
  subjectOther?: string
  learningGoalId?: "lessons" | "catch-up" | "exam-prep"
  examId?: string
  wantsTutor?: boolean
  tutorModeId?: "online" | "in-person" | "flexible"
  super?: "try" | "skip"
  voiceOut?: boolean
}

type Step =
  | "welcome"
  | "language"
  | "who"
  | "name"
  | "meet"
  | "country"
  | "system"
  | "level"
  | "subject"
  | "goal"
  | "exam"
  | "tutor"
  | "mode"
  | "city"
  | "ready"
  | "paywall"

/**
 * Onboard chrome (Duo-shaped, PrepSkul-colored). No wordmark.
 *
 *  welcome   full-screen Mate WAVE, speech TYPES, CTA pops after
 *  ask pages back + solid sky bar
 *            Mate (ask) + speech bubble TYPES while Mate TALKS
 *            choices STAGGER in after the last character
 *            navy paper Continue
 *  ready     Mate CHEER, typed promise
 *  paywall   Mate CHEER + Super stars, benefits construct, Try Super / Not now
 *
 * Mate moods by beat: wave → talk → idle | think | encourage | cheer
 */
export function LearnerOnboard({ initialLocale = "en" }: { initialLocale?: string }) {
  const [answers, setAnswers] = useState<Answers>({
    locale: initialLocale.startsWith("fr") ? "fr" : "en",
    role: "learner",
    name: "",
    countryId: "cm",
    voiceOut: true,
  })
  const [index, setIndex] = useState(0)
  const [forward, setForward] = useState(true)
  const [pulse, setPulse] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const fr = answers.locale === "fr"
  const pack = packById(answers.countryId)
  const system = systemById(pack, answers.systemId)
  const level = system.levels.find((item) => item.id === answers.levelId)
  const availableSubjects = subjectOptionsFor(pack, system, answers.levelId)
  const subject = availableSubjects.find((item) => item.id === answers.subjectId)

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem("skulmate.webOnboard.draft")
      if (draft) {
        const parsed = JSON.parse(draft) as { answers?: Answers; index?: number }
        if (parsed.answers) setAnswers((current) => ({ ...current, ...parsed.answers }))
        if (typeof parsed.index === "number") setIndex(Math.max(0, parsed.index))
      }
    } catch {
      window.localStorage.removeItem("skulmate.webOnboard.draft")
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (answers.voiceOut === false) return
    void prefetchMateLine("welcome", answers.locale)
    void prefetchMateLine("welcome_note", answers.locale)
    void prefetchMateLine("language", answers.locale)
  }, [answers.locale, answers.voiceOut, hydrated])

  const steps = useMemo(() => {
    const list: Step[] = ["welcome", "language", "who", "name", "meet", "country"]
    if (pack.systems.length > 1) list.push("system")
    list.push("level", "subject", "goal")
    if (
      answers.learningGoalId === "exam-prep" &&
      level?.educationLevel !== "Primary School" &&
      system.exams.length > 1
    ) list.push("exam")
    list.push("tutor")
    if (answers.wantsTutor) {
      list.push("mode")
      if (answers.tutorModeId !== "online") list.push("city")
    }
    list.push("ready")
    return list
  }, [pack.id, system.id, answers.learningGoalId, answers.wantsTutor, answers.tutorModeId, level?.educationLevel, system.exams.length])

  const step = steps[Math.min(index, steps.length - 1)]

  useEffect(() => {
    if (!hydrated || index < steps.length) return
    const lastStep = Math.max(steps.length - 1, 0)
    setIndex(lastStep)
    persistDraft(answers, lastStep)
  }, [hydrated, index, steps.length, answers])

  const copy = {
    welcome: mateVoiceText("welcome", answers.locale) || "",
    welcomeNote: mateVoiceText("welcome_note", answers.locale) || "",
    go: fr ? "C’est parti !" : "Let’s go",
    language: mateVoiceText("language", answers.locale) || "",
    who: mateVoiceText("who", answers.locale) || "",
    student: fr ? "C’est moi l’élève" : "I’m the student",
    parent: fr ? "Je choisis pour mon enfant" : "I’m choosing for my child",
    name: answers.role === "parent"
      ? fr ? "Quel est le prénom de l’élève ?" : "What’s the learner’s first name?"
      : mateVoiceText("name", answers.locale) || "",
    meet: answers.role === "parent"
      ? fr
        ? `Ravi de te rencontrer, ${answers.name}. Je garderai les besoins de ton enfant en tête.`
        : `Nice to meet you, ${answers.name}. I’ll keep your learner’s needs in mind.`
      : fr
        ? `Ravi de te rencontrer, ${answers.name}. On va avancer à ton rythme.`
        : `Nice to meet you, ${answers.name}. We’ll go at your pace.`,
    country: mateVoiceText("country", answers.locale) || "",
    system: mateVoiceText("system", answers.locale) || "",
    level: mateVoiceText("level", answers.locale) || "",
    subject: mateVoiceText("subject", answers.locale) || "",
    goal: mateVoiceText("goal", answers.locale) || "",
    exam: mateVoiceText("exam", answers.locale) || "",
    tutor: fr
      ? `Veux-tu aussi réserver un tuteur pour ${subject?.id === "other" ? answers.subjectOther || "cette matière" : t(subject?.label ?? { en: "this subject", fr: "cette matière" }, answers.locale)} ?`
      : `Would you also like to book a tutor for ${subject?.id === "other" ? answers.subjectOther || "this subject" : t(subject?.label ?? { en: "this subject", fr: "cette matière" }, answers.locale)}?`,
    mode: fr ? "Où aimerais-tu apprendre avec ce tuteur ?" : "Where would you love to learn with your tutor?",
    city: mateVoiceText("city", answers.locale) || "",
    ready: answers.role === "parent"
      ? fr ? `Merci, ${answers.name}. J’ai une bonne idée du soutien recherché.` : `Thanks, ${answers.name}. I have a good picture of the support your learner needs.`
      : fr ? `Super, ${answers.name}. J’ai une bonne idée de ce qui t’aidera.` : `Great, ${answers.name}. I have a good picture of what will help you.`,
    readyNote: [
      subject?.id === "other" ? answers.subjectOther : t(subject?.label ?? { en: "your subject", fr: "ta matière" }, answers.locale),
      level?.label ? t(level.label, answers.locale) : undefined,
    ].filter(Boolean).join(" · ") + (answers.wantsTutor
      ? (fr ? ". Mate t’aidera dans tes leçons, et on cherchera un tuteur selon ta matière et ta ville." : ". Mate can help with lessons, and we’ll look for a tutor based on your subject and location.")
      : (fr ? ". Mate t’aidera dans tes leçons, à ton rythme." : ". Mate can help with lessons at your pace.")),
    start: fr ? "Continuer" : "Continue",
    next: fr ? "Continuer" : "Continue",
    skip: fr ? "Pas maintenant" : "Not now",
    payTitle: fr
      ? `${answers.name ? `${answers.name}, ` : ""}essaie Super.`
      : `${answers.name ? `${answers.name}, ` : ""}try Super.`,
    payNote: answers.countryId === "cm"
      ? fr ? "7 jours offerts. Ensuite 2 500 XAF par mois." : "7 days free. Then 2,500 XAF a month."
      : fr ? "7 jours offerts. Le prix local sera affiché dans l’app avant tout abonnement." : "7 days free. Your local price is shown in the app before you subscribe.",
    payCta: fr ? "Essayer Super" : "Try Super",
    paySkip: fr ? "Pas maintenant" : "Not now",
    benefits: fr
      ? ["Leçons Mate illimitées", "Parle sans bouton micro", "Trouve ou demande un tuteur live"]
      : ["Unlimited Mate lessons", "Talk without tapping a mic", "Find or request a live tutor"],
  }

  const titleFor = (s: Step) =>
    ({
      welcome: copy.welcome,
      language: copy.language,
      who: copy.who,
      name: copy.name,
      meet: copy.meet,
      country: copy.country,
      system: copy.system,
      level: copy.level,
      subject: copy.subject,
      goal: copy.goal,
      exam: copy.exam,
      tutor: copy.tutor,
      mode: copy.mode,
      city: copy.city,
      ready: copy.ready,
      paywall: copy.payTitle,
    })[s]

  const noteFor = (s: Step) => s === "ready" ? copy.readyNote : undefined
  const voiceTextFor = (s: Step) => {
    if (s === "meet") return copy.meet
    if (s === "ready") return `${copy.ready} ${copy.readyNote}`
    if (s === "paywall") return `${copy.payTitle} ${copy.payNote}`
    return undefined
  }

  function persistDraft(nextAnswers = answers, nextIndex = index) {
    try {
      window.localStorage.setItem(
        "skulmate.webOnboard.draft",
        JSON.stringify({ answers: nextAnswers, index: nextIndex }),
      )
    } catch {
      /* onboarding remains usable if storage is unavailable */
    }
  }

  function updateDraft(patch: Partial<Answers>) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    persistDraft(next)
  }

  function go(nextIndex: number, dir: boolean) {
    const safeIndex = Math.max(0, Math.min(nextIndex, steps.length - 1))
    setForward(dir)
    setPulse(false)
    setIndex(safeIndex)
    persistDraft(answers, safeIndex)
  }

  function select(patch: Partial<Answers>, id: string) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    persistDraft(next)
    setPulse(true)
    window.setTimeout(() => setPulse(false), 700)
    if (patch.voiceOut === false) {
      try {
        window.localStorage.setItem("skulmate.voiceOut", "off")
      } catch {
        /* ignore */
      }
      stopMateVoice()
    } else if (patch.voiceOut === true) {
      try {
        window.localStorage.setItem("skulmate.voiceOut", "on")
      } catch {
        /* ignore */
      }
    }
  }

  function continueOn() {
    if (step === "ready") { finish(); return }
    go(Math.min(index + 1, steps.length - 1), true)
  }

  function finish(choice?: "try" | "skip") {
    const next = { ...answers, super: choice }
    const appDraft = {
      locale: next.locale,
      accountRole: next.role,
      name: next.name,
      countryId: next.countryId,
      countryOther: next.countryOther,
      cityId: next.cityId,
      cityOther: next.cityOther,
      systemId: next.systemId,
      levelId: next.levelId,
      subjectId: next.subjectId,
      subjectOther: next.subjectOther,
      examId: next.examId,
      learningGoalId: next.learningGoalId,
      tutorModeId: next.tutorModeId,
      wantsTutor: next.wantsTutor,
      channelId: "mix",
      paceId: "balanced",
      voiceOut: next.voiceOut !== false,
      superChoice: choice,
    }
    try {
      window.localStorage.setItem("skulmate.onboard", JSON.stringify(next))
      window.localStorage.setItem("skulmate.webOnboard.draft", JSON.stringify({ answers: next, index }))
      if (choice) window.localStorage.setItem("skulmate.super", choice)
      window.localStorage.setItem("skulmate.voiceOut", next.voiceOut === false ? "off" : "on")
    } catch {
      // Storage may be unavailable; the URL still carries the answers.
    }
    {
      const appUrl = new URL(APP_ORIGIN)
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(appDraft))))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")
      appUrl.hash = `ps-onboarding=${encoded}`
      window.location.href = appUrl.toString()
    }
  }

  const progress = index === 0 ? 0 : (index / (steps.length - 1)) * 100
  const restMood: PrepMateMood =
    step === "paywall" || step === "ready" ? "cheer" : step === "subject" || step === "level" ? "think" : "idle"
  const canContinue =
    step === "meet" ||
    step === "ready" ||
    step === "paywall" ||
    (step === "name" && !!answers.name.trim()) ||
    step === "language" ||
    step === "who" ||
    (step === "country" && (answers.countryId !== "global" || !!answers.countryOther?.trim())) ||
    (step === "system" && !!answers.systemId) ||
    (step === "level" && !!answers.levelId) ||
    (step === "subject" && !!answers.subjectId && (answers.subjectId !== "other" || !!answers.subjectOther?.trim())) ||
    (step === "goal" && !!answers.learningGoalId) ||
    (step === "exam" && !!answers.examId) ||
    (step === "tutor" && answers.wantsTutor !== undefined) ||
    (step === "mode" && !!answers.tutorModeId) ||
    (step === "city" && (answers.cityId === "other" || !pack.cities.length ? !!answers.cityOther?.trim() : !!answers.cityId))

  return (
    <div
      className={`${nunito.className} relative min-h-screen overflow-hidden`}
      style={{
        background: PAPER,
        color: NAVY,
        backgroundImage: "radial-gradient(rgba(27,44,79,0.045) 0.7px, transparent 0.7px)",
        backgroundSize: "7px 7px",
      }}
    >
      <Doodle className="left-6 top-16" kind="sparkle" color={SKY} delay={0} />
      <Doodle className="right-8 top-28" kind="star" color={YELLOW} delay={0.4} />
      <Doodle className="bottom-28 left-8" kind="burst" color={NAVY} delay={0.8} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-6 pt-4">
        {index === 0 ? (
          <div className="h-11" />
        ) : (
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              aria-label={fr ? "Retour" : "Back"}
              onClick={() => go(index - 1, false)}
              className="grid h-10 w-10 place-items-center rounded-full text-2xl font-black"
              style={{ color: NAVY, background: "#fff", boxShadow: "0 3px 0 rgba(27,44,79,0.18)" }}
            >
              ‹
            </button>
            <div className="h-4 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(27,44,79,0.12)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: SKY }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: EASE }}
              />
            </div>
          </div>
        )}

        <div className="relative flex-1">
          <AnimatePresence mode="wait" custom={forward} initial={false}>
            <motion.div
              key={step === "welcome" || step === "paywall" ? step : "questions"}
              className="flex h-full flex-col"
              initial={{ opacity: 0, x: forward ? 28 : -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: forward ? -28 : 28 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              {step === "welcome" ? (
                <Welcome copy={copy} locale={answers.locale} voiceOut={answers.voiceOut !== false} onGo={() => go(1, true)} />
              ) : step === "paywall" ? (
                <Paywall copy={copy} locale={answers.locale} voiceOut={answers.voiceOut !== false} onTry={() => finish("try")} onSkip={() => finish("skip")} />
              ) : (
                <>
                  <Ask
                    title={titleFor(step)}
                    note={noteFor(step)}
                    restMood={pulse ? "encourage" : restMood}
                    intro={step === "ready" ? "cheer" : undefined}
                    voiceId={step}
                    spokenText={voiceTextFor(step)}
                    locale={answers.locale}
                    voiceOut={answers.voiceOut !== false}
                  >
                    {step === "language" && (
                      <div className="flex flex-col gap-2">
                        <Choice glyph="en" label="English" selected={answers.locale === "en"} onClick={() => select({ locale: "en" }, "en")} />
                        <Choice glyph="fr" label="Français" selected={answers.locale === "fr"} onClick={() => select({ locale: "fr" }, "fr")} />
                      </div>
                    )}
                    {step === "who" && (
                      <div className="flex flex-col gap-2">
                        <Choice glyph="student" label={copy.student} selected={answers.role === "learner"} onClick={() => select({ role: "learner" }, "learner")} />
                        <Choice glyph="parent" label={copy.parent} selected={answers.role === "parent"} onClick={() => select({ role: "parent" }, "parent")} />
                      </div>
                    )}
                    {step === "name" && (
                      <input
                        value={answers.name}
                        onChange={(e) => {
                          const next = { ...answers, name: e.target.value }
                          setAnswers(next)
                          persistDraft(next)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") continueOn()
                        }}
                        placeholder={fr ? (answers.role === "parent" ? "Prénom de l’élève" : "Ton prénom") : (answers.role === "parent" ? "Learner’s first name" : "Your first name")}
                        className="h-14 w-full rounded-[18px] border-2 bg-white px-4 text-center text-[22px] font-extrabold outline-none"
                        style={{ color: NAVY, borderColor: answers.name ? SKY : "rgba(27,44,79,0.16)", boxShadow: "0 4px 0 rgba(27,44,79,0.12)" }}
                      />
                    )}
                    {step === "meet" && (
                      <div className="rounded-2xl bg-[#E0F2FE] px-4 py-3 text-sm font-bold leading-relaxed text-[#1B2C4F]">
                        {fr
                          ? "Merci de me l’avoir dit. Je vais personnaliser la suite avec tes réponses."
                          : "Thanks for telling me. I’ll use your answers to make the next steps fit you."}
                      </div>
                    )}
                    {step === "country" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {REGION_PACKS.map((p: RegionPack) => (
                            <Choice
                              key={p.id}
                              glyph={p.id === "fr" ? "fr_country" : p.id}
                              label={t(p.label, answers.locale)}
                              selected={answers.countryId === p.id}
                              onClick={() =>
                                select(
                                  { countryId: p.id, countryOther: "", cityId: undefined, cityOther: "", systemId: undefined, levelId: undefined, subjectId: undefined },
                                  p.id,
                                )
                              }
                            />
                          ))}
                        </div>
                        {answers.countryId === "global" && (
                          <input
                            value={answers.countryOther ?? ""}
                            onChange={(event) => updateDraft({ countryOther: event.target.value })}
                            aria-label={fr ? "Ton pays" : "Your country"}
                            placeholder={fr ? "Dans quel pays ?" : "Which country?"}
                            className="h-12 w-full rounded-2xl border-2 bg-white px-4 font-bold outline-none"
                            style={{ borderColor: SKY, color: NAVY }}
                          />
                        )}
                      </div>
                    )}
                    {step === "system" &&
                      <div className={`grid gap-2 ${pack.systems.length === 2 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {pack.systems.map((s) => (
                          <Choice
                            key={s.id}
                            glyph={s.id}
                            label={`${pack.id === "cm" ? (s.id === "cm-francophone" ? "📘 " : "📗 ") : ""}${t(s.label, answers.locale)}`}
                            selected={answers.systemId === s.id}
                            onClick={() => select({ systemId: s.id, levelId: undefined, subjectId: undefined, subjectOther: undefined, examId: undefined }, s.id)}
                          />
                        ))}
                      </div>}
                    {step === "level" && (
                      <div className="grid grid-cols-2 gap-2">
                        {system.levels.map((l) => (
                          <Chip
                            key={l.id}
                            label={t(l.label, answers.locale)}
                            selected={answers.levelId === l.id}
                            onClick={() => select({ levelId: l.id, subjectId: undefined, subjectOther: undefined, examId: undefined }, l.id)}
                          />
                        ))}
                      </div>
                    )}
                    {step === "subject" &&
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {availableSubjects.map((s) => (
                            <Choice
                              key={s.id}
                              glyph={s.id}
                              label={t(s.label, answers.locale)}
                              selected={answers.subjectId === s.id}
                              onClick={() => select({ subjectId: s.id, subjectOther: "" }, s.id)}
                            />
                          ))}
                        </div>
                        {answers.subjectId === "other" && (
                          <input
                            value={answers.subjectOther ?? ""}
                            onChange={(event) => updateDraft({ subjectOther: event.target.value })}
                            aria-label={fr ? "La matière" : "The subject"}
                            placeholder={fr ? "Quelle matière ?" : "Which subject?"}
                            className="h-12 w-full rounded-2xl border-2 bg-white px-4 font-bold outline-none"
                            style={{ borderColor: SKY, color: NAVY }}
                          />
                        )}
                      </div>}
                    {step === "goal" && (
                      <div className="flex flex-col gap-2">
                        <Choice glyph="book" label={fr ? "Comprendre mes leçons et devoirs" : "Understand lessons and homework"} selected={answers.learningGoalId === "lessons"} onClick={() => select({ learningGoalId: "lessons", examId: undefined }, "goal-lessons")} />
                        <Choice glyph="maths" label={fr ? "Rattraper ce que j’ai manqué" : "Catch up on something I missed"} selected={answers.learningGoalId === "catch-up"} onClick={() => select({ learningGoalId: "catch-up", examId: undefined }, "goal-catchup")} />
                        {level?.educationLevel !== "Primary School" && (
                          <Choice glyph="medal" label={fr ? "Me préparer à un examen" : "Prepare for an exam"} selected={answers.learningGoalId === "exam-prep"} onClick={() => select({ learningGoalId: "exam-prep", examId: undefined }, "goal-exam")} />
                        )}
                      </div>
                    )}
                    {step === "exam" && (
                      <div className="flex flex-col gap-2">
                        {system.exams.filter((item) => item.id !== "none").map((item) => (
                          <Choice key={item.id} glyph={item.id} label={t(item.label, answers.locale)} selected={answers.examId === item.id} onClick={() => select({ examId: item.id }, item.id)} />
                        ))}
                        <button type="button" onClick={() => select({ examId: "unsure" }, "exam-unsure")} className="min-h-12 rounded-2xl border-2 bg-white px-4 text-left font-bold" style={{ borderColor: answers.examId === "unsure" ? SKY : "rgba(27,44,79,0.16)" }}>
                          {fr ? "Je ne sais pas encore" : "I’m not sure yet"}
                        </button>
                      </div>
                    )}
                    {step === "tutor" && (
                      <div className="flex flex-col gap-2">
                        <Choice glyph="student" label={fr ? "Oui, aide-moi à trouver un tuteur" : "Yes, help me find a tutor"} selected={answers.wantsTutor === true} onClick={() => select({ wantsTutor: true }, "tutor-yes")} />
                        <Choice glyph="book" label={fr ? "Pas maintenant, je continue avec Mate" : "Not now, I’ll continue with Mate"} selected={answers.wantsTutor === false} onClick={() => select({ wantsTutor: false, tutorModeId: undefined, cityId: undefined, cityOther: "" }, "tutor-no")} />
                      </div>
                    )}
                    {step === "mode" && (
                      <div className="flex flex-col gap-2">
                        <Choice glyph="online" label={fr ? "En ligne" : "Online"} selected={answers.tutorModeId === "online"} onClick={() => select({ tutorModeId: "online", cityId: undefined, cityOther: "" }, "mode-online")} />
                        <Choice glyph="home" label={fr ? "À la maison ou à l’école" : "At home or school"} selected={answers.tutorModeId === "in-person"} onClick={() => select({ tutorModeId: "in-person" }, "mode-person")} />
                        <Choice glyph="globe" label={fr ? "En ligne ou en personne" : "Online or in person"} selected={answers.tutorModeId === "flexible"} onClick={() => select({ tutorModeId: "flexible" }, "mode-any")} />
                      </div>
                    )}
                    {step === "city" && (
                      <div className="space-y-3">
                        {pack.cities.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {pack.cities.map((item) => (
                              <Choice key={item.id} glyph={`city-${item.id}`} label={t(item.label, answers.locale)} selected={answers.cityId === item.id} onClick={() => select({ cityId: item.id, cityOther: "" }, item.id)} />
                            ))}
                          </div>
                        )}
                        {(!pack.cities.length || answers.cityId === "other") && (
                          <input
                            value={answers.cityOther ?? ""}
                            onChange={(event) => updateDraft({ cityOther: event.target.value })}
                            aria-label={fr ? "Ta ville" : "Your town or city"}
                            placeholder={fr ? "Ta ville" : "Your town or city"}
                            className="h-12 w-full rounded-2xl border-2 bg-white px-4 font-bold outline-none"
                            style={{ borderColor: SKY, color: NAVY }}
                          />
                        )}
                      </div>
                    )}
                    {step === "ready" && (
                      <div className="mt-1 space-y-3">
                        <div
                          className="overflow-hidden rounded-[22px] border-2 bg-white"
                          style={{ borderColor: NAVY, boxShadow: "0 5px 0 rgba(27,44,79,0.16)" }}
                        >
                          <div className="flex items-center gap-2 border-b border-[#1B2C4F]/10 px-3 py-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: SKY, animation: "listen-pulse 1.6s ease-out infinite" }}
                            />
                            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: SKY }}>
                              {fr ? "Apprends en parlant ou en écrivant." : "Learn by talking or typing."}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-3">
                            <div className="relative h-24 overflow-hidden rounded-xl bg-[#E7F4D8]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/math-formula-illustration.jpg" alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="rounded-xl bg-[#D9EEF6] p-2 text-[11px] font-bold leading-snug" style={{ color: NAVY }}>
                              {fr
                                ? "Tableau, image, ou check. La leçon avance avec toi."
                                : "Board, picture, or a check. The lesson moves with you."}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Chip
                            label={fr ? "Mate lit à voix haute" : "Mate reads out loud"}
                            selected={answers.voiceOut !== false}
                            onClick={() => select({ voiceOut: true }, "voice-on")}
                          />
                          <Chip
                            label={fr ? "Je lis en silence" : "I’ll read quietly"}
                            selected={answers.voiceOut === false}
                            onClick={() => select({ voiceOut: false }, "voice-off")}
                          />
                        </div>
                      </div>
                    )}
                  </Ask>
                  <Primary
                    label={step === "ready" ? copy.start : copy.next}
                    disabled={!canContinue}
                    onClick={continueOn}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Welcome({
  copy,
  locale,
  voiceOut,
  onGo,
}: {
  copy: { welcome: string; welcomeNote: string; go: string }
  locale: "en" | "fr"
  voiceOut: boolean
  onGo: () => void
}) {
  const [typed, setTyped] = useState(false)
  const [armed, setArmed] = useState(!voiceOut)
  const [talking, setTalking] = useState(false)
  const [welcomeTitleProgress, setWelcomeTitleProgress] = useState<number | undefined>()
  const [welcomeNoteProgress, setWelcomeNoteProgress] = useState<number | undefined>()
  const playingRef = useRef(false)

  useEffect(() => {
    setTyped(false)
    setWelcomeTitleProgress(voiceOut ? 0 : undefined)
    setWelcomeNoteProgress(voiceOut ? 0 : undefined)
    setArmed(true)
    if (!voiceOut) {
      stopMateVoice()
      setArmed(true)
      return
    }
    let cancelled = false
    playingRef.current = true
    const talk = async () => {
      try {
        await speakMateLine("welcome", locale, {
          onStart: () => {
            if (cancelled) return
            setTalking(true)
            setArmed(true)
          },
          onPause: () => { if (!cancelled) setTalking(false) },
          onProgress: value => { if (!cancelled) setWelcomeTitleProgress(value) },
        })
        if (cancelled) return
        await speakMateLine("welcome_note", locale, {
          onStart: () => {
            if (cancelled) return
            setTalking(true)
            setArmed(true)
          },
          onPause: () => { if (!cancelled) setTalking(false) },
          onProgress: value => { if (!cancelled) setWelcomeNoteProgress(value) },
        })
        if (!cancelled) setTalking(false)
      } catch {
        if (!cancelled) {
          setArmed(true)
          setTalking(false)
        }
      } finally {
        playingRef.current = false
      }
    }
    void talk()
    return () => {
      cancelled = true
      playingRef.current = false
      stopMateVoice()
    }
  }, [locale, voiceOut])

  const mood: PrepMateMood = talking ? "talk" : typed ? "idle" : "wave"

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center pb-4 pt-2">
        <motion.div
          initial={{ scale: 0.72, y: 28, rotate: -8 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <PrepMate mood={mood} size={248} variant="hero" priority />
        </motion.div>
        <Speech
          className="mt-5 w-full"
          title={copy.welcome}
          note={copy.welcomeNote}
          titleProgress={welcomeTitleProgress}
          noteProgress={welcomeNoteProgress}
          armed={armed}
          onReplay={() => {
            void unlockMateVoice()
            stopMateVoice()
            setArmed(true)
            setTalking(false)
            setWelcomeTitleProgress(0)
            setWelcomeNoteProgress(0)
            void speakMateLine("welcome", locale, {
              onStart: () => {
                setTalking(true)
                setArmed(true)
              },
              onPause: () => setTalking(false),
              onProgress: setWelcomeTitleProgress,
            })
              .then(completed => completed ? speakMateLine("welcome_note", locale, {
                onStart: () => setTalking(true),
                onPause: () => setTalking(false),
                onProgress: setWelcomeNoteProgress,
              }) : undefined)
              .finally(() => setTalking(false))
          }}
          replayLabel={locale === "fr" ? "Écouter" : "Listen"}
          onTyped={() => setTyped(true)}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={typed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.38, ease: EASE }}
        style={{ pointerEvents: typed ? "auto" : "none" }}
      >
        <Primary label={copy.go} onClick={onGo} />
      </motion.div>
    </div>
  )
}

function Paywall({
  copy,
  locale,
  voiceOut,
  onTry,
  onSkip,
}: {
  copy: {
    payTitle: string
    payNote: string
    payCta: string
    paySkip: string
    benefits: string[]
  }
  locale: "en" | "fr"
  voiceOut: boolean
  onTry: () => void
  onSkip: () => void
}) {
  const [typed, setTyped] = useState(false)
  const [talking, setTalking] = useState(false)
  const [armed, setArmed] = useState(true)
  const [progress, setProgress] = useState<number | undefined>()

  useEffect(() => {
    if (!voiceOut) {
      setProgress(undefined)
      setArmed(true)
      return
    }
    let cancelled = false
    setArmed(true)
    setProgress(0)
    void speakMateText(`${copy.payTitle}. ${copy.payNote}`, locale, {
      onStart: () => {
        if (!cancelled) {
          setTalking(true)
          setArmed(true)
        }
      },
      onPause: () => setTalking(false),
          onProgress: setProgress,
    }).finally(() => {
      if (!cancelled) { setArmed(true); setTalking(false) }
    })
    return () => {
      cancelled = true
      stopMateVoice()
    }
  }, [locale, voiceOut, copy.payTitle, copy.payNote])
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center pb-4 pt-2">
        <motion.div
          initial={{ scale: 0.78, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
        >
          <PrepMate mood={talking ? "talk" : "encourage"} size={196} variant="hero" />
        </motion.div>
        <Speech
          className="mt-4 w-full"
          title={copy.payTitle}
          note={copy.payNote}
          progress={progress}
          armed={armed}
          onReplay={() => {
            void unlockMateVoice()
            setProgress(0)
            setArmed(true)
            void speakMateText(`${copy.payTitle}. ${copy.payNote}`, locale, {
              onStart: () => { setArmed(true); setTalking(true) },
              onPause: () => setTalking(false),
          onProgress: setProgress,
            }).finally(() => { setArmed(true); setTalking(false) })
          }}
          replayLabel={locale === "fr" ? "Écouter" : "Listen"}
          onTyped={() => setTyped(true)}
        />
        <div className="mt-4 w-full">
          <Stagger ready={typed}>
            {copy.benefits.map((item) => (
              <Benefit key={item} label={item} />
            ))}
          </Stagger>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={typed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.12 }}
      >
        <Primary label={copy.payCta} onClick={onTry} />
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full py-2 text-center text-sm font-extrabold"
          style={{ color: "#5B6B86" }}
        >
          {copy.paySkip}
        </button>
      </motion.div>
    </div>
  )
}

function Ask({
  title,
  note,
  restMood,
  intro,
  voiceId,
  spokenText,
  locale,
  voiceOut,
  children,
}: {
  title: string
  note?: string
  restMood: PrepMateMood
  intro?: PrepMateMood
  voiceId: string
  spokenText?: string
  locale: "en" | "fr"
  voiceOut: boolean
  children: ReactNode
}) {
  const [typed, setTyped] = useState(false)
  const [armed, setArmed] = useState(!voiceOut)
  const [talking, setTalking] = useState(false)
  const [writing, setWriting] = useState(false)
  const [phase, setPhase] = useState<PrepMateMood>(intro ?? "idle")
  const [progress, setProgress] = useState<number | undefined>()

  useEffect(() => {
    setTyped(false)
    setArmed(true)
    setTalking(false)
    setWriting(false)
    setPhase(intro ?? "idle")
    setProgress(undefined)
  }, [title, intro, voiceOut])

  useEffect(() => {
    const phrase = voiceId as MateVoicePhrase
    if (!voiceOut) {
      setProgress(undefined)
      stopMateVoice()
      setArmed(true)
      return
    }
    let cancelled = false
    setProgress(0)
    const startSpeech = spokenText
      ? speakMateText(spokenText, locale, {
          onStart: () => {
            if (cancelled) return
            setTalking(true)
            setArmed(true)
          },
          onPause: () => setTalking(false),
          onProgress: setProgress,
        })
      : speakMateLine(phrase, locale, {
          onStart: () => {
            if (cancelled) return
            setTalking(true)
            setArmed(true)
          },
          onPause: () => setTalking(false),
          onProgress: setProgress,
        })
    void startSpeech.finally(() => {
      if (!cancelled) {
        setTalking(false)
        setArmed(true)
      }
    })
    return () => {
      cancelled = true
      stopMateVoice()
    }
  }, [voiceId, spokenText, locale, voiceOut])

  const replay = () => {
    void unlockMateVoice()
    stopMateVoice()
    setProgress(0)
    const opts = {
      onStart: () => {
        setTalking(true)
        setArmed(true)
      },
      onPause: () => setTalking(false),
          onProgress: setProgress,
    }
    const speech = spokenText
      ? speakMateText(spokenText, locale, opts)
      : speakMateLine(voiceId as MateVoicePhrase, locale, opts)
    void speech.finally(() => setTalking(false))
  }

  const mood = talking ? "talk" : restMood
  const questionPose = voiceId === "name" || voiceId === "who" ? "wave"
    : voiceId === "meet" ? "happy"
    : voiceId === "level" ? "thinking"
    : voiceId === "subject" || voiceId === "exam" ? "thinking"
    : voiceId === "goal" ? "idea"
    : voiceId === "country" || voiceId === "city" || voiceId === "mode" ? "idle"
    : voiceId === "ready" ? "celebrate" : "encourage"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-start gap-3 pt-3">
        <motion.div
          initial={{ scale: 0.72, rotate: -8, y: 10 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
        >
          <PrepMate mood={mood} state={talking ? undefined : restMood === "encourage" ? "success" : writing ? "studying" : questionPose} size={108} variant="ask" />
        </motion.div>
        <Speech title={title} note={note} progress={progress} tail armed={armed} onReplay={replay} replayLabel={locale === "fr" ? "Écouter" : "Listen"} onTyped={() => setTyped(true)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4"
        onFocusCapture={event => { if (event.target instanceof HTMLInputElement) setWriting(true) }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setWriting(false) }}
      >
        <Stagger ready={typed}>{children}</Stagger>
      </div>
    </div>
  )
}

function Speech({
  title,
  note,
  progress,
  titleProgress,
  noteProgress,
  tail = false,
  armed = true,
  className = "",
  onReplay,
  replayLabel,
  onTyped,
}: {
  title: string
  note?: string
  progress?: number
  titleProgress?: number
  noteProgress?: number
  tail?: boolean
  armed?: boolean
  className?: string
  onReplay?: () => void
  replayLabel?: string
  onTyped?: () => void
}) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce && armed ? title.length : 0)
  const combinedLength = title.length + (note?.length ?? 0)
  const titleShown = reduce ? title.length : titleProgress !== undefined
    ? Math.floor(titleProgress * title.length)
    : progress !== undefined
      ? Math.min(title.length, Math.floor(progress * combinedLength))
      : shown
  const noteShown = reduce ? (note?.length ?? 0) : noteProgress !== undefined
    ? Math.floor(noteProgress * (note?.length ?? 0))
    : progress !== undefined && note
      ? Math.max(0, Math.min(note.length, Math.floor(progress * combinedLength) - title.length))
      : shown >= title.length ? (note?.length ?? 0) : 0
  const done = titleShown >= title.length
  const allDone = done && noteShown >= (note?.length ?? 0)
  const onTypedRef = useRef(onTyped)
  onTypedRef.current = onTyped

  useEffect(() => {
    if (progress !== undefined || titleProgress !== undefined || noteProgress !== undefined) return
    if (!armed) {
      setShown(0)
      return
    }
    if (reduce) {
      setShown(title.length)
      onTypedRef.current?.()
      return
    }
    setShown(0)
    let i = 0
    let raf = 0
    let last = performance.now()
    let wait = 160
    const tick = (now: number) => {
      if (now - last < wait) {
        raf = requestAnimationFrame(tick)
        return
      }
      last = now
      i += 1
      setShown(Math.min(i, title.length))
      if (i >= title.length) {
        onTypedRef.current?.()
        return
      }
      const ch = title[i - 1]
      wait = ch === "." || ch === "?" || ch === "!" ? 220 : ch === "," ? 90 : 38
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [title, reduce, armed, progress, titleProgress, noteProgress])

  useEffect(() => {
    if (allDone) onTypedRef.current?.()
  }, [allDone])

  return (
    <motion.div
      className={`relative flex-1 rounded-[22px] border-[3px] bg-white px-4 py-3 text-left ${className}`}
      style={{ borderColor: NAVY, boxShadow: "0 6px 0 rgba(27,44,79,0.22)" }}
      initial={{ scale: 0.86, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.04 }}
    >
      {tail ? (
        <span
          className="absolute left-[-11px] top-7 h-0 w-0"
          style={{
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: `11px solid ${NAVY}`,
          }}
        />
      ) : null}
      {tail ? (
        <span
          className="absolute left-[-6px] top-[30px] h-0 w-0"
          style={{
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid #fff",
          }}
        />
      ) : null}
      {onReplay && (
        <button
          type="button"
          onClick={onReplay}
          aria-label={replayLabel || "Listen"}
          title={replayLabel || "Listen"}
          className="absolute right-2 top-2 flex h-9 items-center gap-1 rounded-full px-2 text-xs font-extrabold text-[#1B2C4F] transition hover:bg-[#E0F2FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
        >
          <Volume2 aria-hidden="true" size={19} />
          <span>{replayLabel || "Listen"}</span>
        </button>
      )}
      <p aria-label={title} className={`${display.className} relative pr-9 text-[22px] font-semibold leading-snug`} style={{ color: NAVY }}>
        <span aria-hidden className="invisible">{title}</span>
        <span aria-hidden className="absolute inset-0 pr-9">{title.slice(0, titleShown)}
        {!done ? (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[0.9em] w-[2px] align-[-0.1em]"
            style={{ background: NAVY, animation: "pulse 0.9s ease-in-out infinite" }}
          />
        ) : null}</span>
      </p>
      {note ? (
        <motion.p
          aria-label={note}
          className="relative mt-1 text-[13px] font-semibold leading-snug"
          style={{ color: "#5B6B86" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span aria-hidden className="invisible">{note}</span>
          <span aria-hidden className="absolute inset-0">{note.slice(0, noteShown)}</span>
        </motion.p>
      ) : null}
    </motion.div>
  )
}

function Stagger({ ready, children }: { ready: boolean; children: ReactNode }) {
  const items = Children.toArray(children)
  return (
    <>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
          transition={{ delay: ready ? 0.08 + i * 0.11 : 0, duration: 0.42, ease: EASE }}
          style={{ pointerEvents: ready ? "auto" : "none" }}
        >
          {child}
        </motion.div>
      ))}
    </>
  )
}

function Benefit({ label }: { label: string }) {
  return (
    <div
      className="mb-2.5 flex min-h-[56px] w-full items-center gap-3 rounded-[18px] border-[2px] bg-white px-3 py-2.5"
      style={{ borderColor: "rgba(27,44,79,0.16)", boxShadow: "0 5px 0 rgba(27,44,79,0.14)" }}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-full text-lg font-black"
        style={{ background: "#FEF9C3", color: NAVY, border: `2px solid ${NAVY}` }}
      >
        ★
      </span>
      <span className={`${display.className} text-[16px] font-semibold leading-snug`}>{label}</span>
    </div>
  )
}

function Choice({
  glyph,
  label,
  hint,
  selected,
  onClick,
}: {
  glyph: string
  label: string
  hint?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97, y: 4 }}
      className="flex min-h-[68px] w-full items-center gap-2 rounded-[22px] border-[2px] bg-white px-2 py-2 text-left sm:gap-3 sm:px-3"
      style={{
        borderColor: selected ? SKY : "rgba(27,44,79,0.16)",
        boxShadow: selected ? `0 6px 0 ${NAVY}` : "0 6px 0 rgba(27,44,79,0.18)",
        background: selected ? "#E0F2FE" : "#FFFFFF",
        transform: selected ? "translateY(-1px)" : undefined,
      }}
    >
      <Glyph kind={glyph} selected={selected} />
      <span className="flex-1">
        <span className={`${display.className} block text-[15px] font-semibold leading-snug sm:text-[16px]`}>{label}</span>
        {hint ? <span className="text-xs font-bold" style={{ color: SKY }}>{hint}</span> : null}
      </span>
    </motion.button>
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="rounded-full border-[3px] px-3.5 py-2 text-sm font-extrabold"
      style={{
        background: selected ? YELLOW : "#fff",
        borderColor: selected ? NAVY : "rgba(27,44,79,0.14)",
        color: NAVY,
      }}
    >
      {label}
    </motion.button>
  )
}

function Primary({
  label,
  onClick,
  disabled = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.98, y: 5 }}
      className={`${display.className} mt-auto flex h-14 w-full items-center justify-center rounded-[18px] text-[20px] font-semibold tracking-tight text-white`}
      style={{
        background: disabled ? "#CBD5E1" : NAVY,
        boxShadow: disabled ? "0 2px 0 #A8B3C4" : `0 7px 0 ${NAVY_SHADOW}`,
        opacity: 1,
      }}
    >
      {label}
    </motion.button>
  )
}

function Doodle({
  className,
  kind,
  color,
  delay,
}: {
  className: string
  kind: "sparkle" | "star" | "burst"
  color: string
  delay: number
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute h-10 w-10 ${className}`}
      style={{ color }}
      animate={{ rotate: [0, 12, -8, 0], y: [0, -6, 0] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {kind === "sparkle" ? (
        <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <line x1="20" y1="4" x2="20" y2="36" />
          <line x1="4" y1="20" x2="36" y2="20" />
          <line x1="9" y1="9" x2="31" y2="31" />
          <line x1="31" y1="9" x2="9" y2="31" />
        </g>
      ) : kind === "star" ? (
        <polygon
          fill="currentColor"
          points="20,3 24,14 36,14 26,21 30,33 20,26 10,33 14,21 4,14 16,14"
        />
      ) : (
        <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI) / 3 - Math.PI / 2
            return (
              <line
                key={i}
                x1={20 + 8 * Math.cos(a)}
                y1={20 + 8 * Math.sin(a)}
                x2={20 + 16 * Math.cos(a)}
                y2={20 + 16 * Math.sin(a)}
              />
            )
          })}
        </g>
      )}
    </motion.svg>
  )
}
