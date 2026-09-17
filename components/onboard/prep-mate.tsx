"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

export type PrepMateMood = "idle" | "wave" | "talk" | "think" | "cheer" | "encourage"

const NAVY = "#1B2C4F"
const BLUE = "#4A6FBF"
const BELLY = "#0EA5E9"
const YELLOW = "#EAB308"

/**
 * Mate, drawn in vectors and animated with Primar physics.
 *
 * Generated paper-craft art defined the look (idle, wave, talk, think,
 * encourage, cheer, super). This rig is what ships, so he answers a mood
 * change in the same frame, blinks irregularly, and the antenna lags the body
 * instead of being glued to it.
 *
 * Moods used throughout onboard:
 *   wave      intro hop, one arm waving
 *   talk      mouth flaps while the question types
 *   idle      breathing rest after he finishes speaking
 *   think     chin pose when the choice needs a second
 *   encourage hop + thumbs up after a pick
 *   cheer     both arms up, stars, open laugh (ready + Super)
 */
export function PrepMate({
  mood = "idle",
  size = 168,
  variant = "hero",
}: {
  mood?: PrepMateMood
  size?: number
  variant?: "hero" | "ask"
}) {
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const moodRef = useRef(mood)

  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = new MateSim(moodRef.current)
    let last = performance.now()
    let raf = 0
    let alive = true

    const draw = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      state.mood = moodRef.current
      if (!reduce) state.tick(dt)
      paint(canvas, state, size, Boolean(reduce))
      raf = requestAnimationFrame(draw)
    }

    const onMood = () => state.trigger(moodRef.current)
    onMood()
    if (!reduce) state.tick(0)
    paint(canvas, state, size, Boolean(reduce))
    raf = requestAnimationFrame(draw)

    const observer = new MutationObserver(onMood)
    observer.observe(canvas, { attributes: true, attributeFilter: ["data-mood"] })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [size, reduce])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.dataset.mood = mood
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-mood={mood}
      width={size * 2}
      height={size * 2}
      style={{
        width: size,
        height: size,
        display: "block",
        flexShrink: 0,
        pointerEvents: "none",
        marginTop: variant === "ask" ? -6 : 0,
      }}
    />
  )
}

class MateSim {
  mood: PrepMateMood = "idle"
  private prev: PrepMateMood = "idle"
  bodyY = 0
  bodyV = 0
  antenna = 0
  antennaV = 0
  breath = 0
  talk = 0
  reaction = 0
  impact = 0
  blinkTimer = 2
  blinkFor = 0
  gaze = 0
  gazeTarget = 0
  gazeTimer = 1.5
  private rng = Math.random

  constructor(mood: PrepMateMood) {
    this.mood = mood
    this.prev = mood
    this.bodyV = 28
    if (mood !== "idle") this.trigger(mood)
  }

  trigger(mood: PrepMateMood) {
    this.mood = mood
    this.prev = mood
    this.reaction = 1
    if (mood === "cheer") this.bodyV = 46
    else if (mood === "wave") this.bodyV = 34
    else if (mood === "encourage") {
      this.bodyV = 22
      this.antennaV = -7
    } else if (mood === "talk") this.bodyV = 12
    else if (mood === "think") this.gazeTarget = 0.8
    else this.gazeTarget = 0
  }

  tick(dt: number) {
    if (this.mood !== this.prev) this.trigger(this.mood)

    this.breath += dt * 1.5
    if (this.mood === "talk") this.talk += dt
    else this.talk += dt * 0.15
    this.reaction = clamp(this.reaction - dt * 1.6, 0, 1)
    this.impact = clamp(this.impact - dt * 4.5, 0, 1)

    const wasFalling = this.bodyV
    const k = 210
    const damping = 13
    this.bodyV += (-k * this.bodyY - damping * this.bodyV) * dt
    this.bodyY += this.bodyV * dt

    if (wasFalling < -18 && this.bodyV >= wasFalling && this.bodyY < 1 && this.bodyY > -1) {
      this.impact = 1
    }

    const drive = -this.bodyV * 0.03
    this.antennaV += ((drive - this.antenna) * 90 - this.antennaV * 9) * dt
    this.antenna += this.antennaV * dt

    this.blinkTimer -= dt
    if (this.blinkFor > 0) this.blinkFor -= dt
    else if (this.blinkTimer <= 0) {
      this.blinkFor = 0.12
      this.blinkTimer = 1.8 + this.rng() * 3.4
    }

    this.gazeTimer -= dt
    if (this.gazeTimer <= 0) {
      this.gazeTimer = 1.2 + this.rng() * 2.2
      if (this.mood === "idle" || this.mood === "talk") this.gazeTarget = (this.rng() - 0.5) * 1.4
    }
    this.gaze += (this.gazeTarget - this.gaze) * clamp(dt * 6, 0, 1)
  }
}

function paint(canvas: HTMLCanvasElement, sim: MateSim, cssSize: number, frozen: boolean) {
  const dpr = Math.min(2.5, window.devicePixelRatio || 1)
  const px = Math.round(cssSize * dpr)
  if (canvas.width !== px || canvas.height !== px) {
    canvas.width = px
    canvas.height = px
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, px, px)
  ctx.save()
  ctx.scale(px / 100, px / 100)

  const float = frozen ? 0 : Math.sin(sim.breath) * 1.8
  const stretch = clamp(sim.bodyV * 0.0022, -0.16, 0.16)
  const tilt = clamp(-sim.bodyV * 0.0016, -0.11, 0.11)

  ctx.translate(50, 52 + (-sim.bodyY + float))
  ctx.rotate(tilt)
  ctx.scale(1 - stretch, 1 + stretch)
  ctx.translate(-50, -52)

  const elated = sim.mood === "cheer"
  drawSparks(ctx, sim, elated)
  drawArms(ctx, sim, elated)
  drawFeet(ctx)
  drawBody(ctx)
  drawAntenna(ctx, sim)
  drawFace(ctx, sim, elated)
  drawImpact(ctx, sim)
  ctx.restore()
}

function bodyPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(50, 15)
  ctx.bezierCurveTo(68, 15, 79, 30, 79, 50)
  ctx.bezierCurveTo(79, 72, 68, 85, 50, 85)
  ctx.bezierCurveTo(32, 85, 21, 72, 21, 50)
  ctx.bezierCurveTo(21, 30, 32, 15, 50, 15)
  ctx.closePath()
}

function drawBody(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.translate(2.2, 3.4)
  bodyPath(ctx)
  ctx.fillStyle = NAVY
  ctx.fill()
  ctx.restore()

  bodyPath(ctx)
  ctx.fillStyle = BLUE
  ctx.fill()

  ctx.save()
  bodyPath(ctx)
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(50, 72, 24, 22, 0, 0, Math.PI * 2)
  ctx.fillStyle = BELLY
  ctx.fill()
  ctx.restore()

  bodyPath(ctx)
  ctx.strokeStyle = NAVY
  ctx.lineWidth = 3.4
  ctx.lineJoin = "round"
  ctx.stroke()
}

function drawFeet(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = NAVY
  for (const dx of [-13, 13]) {
    ctx.beginPath()
    ctx.ellipse(50 + dx, 86, 8.5, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawAntenna(ctx: CanvasRenderingContext2D, sim: MateSim) {
  const sway = sim.antenna * 26 + Math.sin(sim.breath * 0.8) * 1.6
  const tipX = 50 + sway
  const tipY = 1

  ctx.beginPath()
  ctx.moveTo(50, 17)
  ctx.quadraticCurveTo(50 + sway * 0.4, 8, tipX, tipY)
  ctx.strokeStyle = NAVY
  ctx.lineWidth = 3.4
  ctx.lineCap = "round"
  ctx.stroke()

  roundRect(ctx, 41, 13.5, 18, 7, 3)
  ctx.fillStyle = BELLY
  ctx.fill()

  ctx.beginPath()
  ctx.arc(tipX, tipY, 5.6, 0, Math.PI * 2)
  ctx.fillStyle = YELLOW
  ctx.fill()
  ctx.beginPath()
  ctx.arc(tipX, tipY, 2.4, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(250,204,21,0.55)"
  ctx.fill()
  ctx.beginPath()
  ctx.arc(tipX, tipY, 5.6, 0, Math.PI * 2)
  ctx.strokeStyle = NAVY
  ctx.lineWidth = 2.4
  ctx.stroke()
}

function drawArms(ctx: CanvasRenderingContext2D, sim: MateSim, elated: boolean) {
  const waving = sim.mood === "wave"
  const talking = sim.mood === "talk"
  const thumb = sim.mood === "encourage"
  const lift = elated ? 1 : thumb ? 0.35 : talking ? 0.42 : waving ? 0.2 : 0
  const idleWave = elated
    ? Math.sin(sim.breath * 6) * 3
    : talking
      ? Math.sin(sim.breath * 3.2) * 2.2
      : sim.mood === "idle"
        ? Math.sin(sim.breath * 2.2) * 1.4
        : 0

  ctx.strokeStyle = NAVY
  ctx.fillStyle = NAVY
  ctx.lineWidth = 3.4
  ctx.lineCap = "round"

  for (const side of [-1, 1]) {
    const thinkArm = sim.mood === "think" && side < 0
    const waveArm = waving && side > 0
    const thumbArm = thumb && side < 0
    const shoulder = { x: 50 + side * 30, y: 56 }
    const hand = thinkArm
      ? { x: 42, y: 58 }
      : waveArm
        ? {
            x: 74 + Math.sin(sim.breath * 8) * 7,
            y: 22 + Math.cos(sim.breath * 8) * 4,
          }
        : thumbArm
          ? { x: 22, y: 34 }
          : {
              x: 50 + side * (40 + lift * 6) + side * idleWave,
              y: 56 - lift * 30 + (lift === 0 ? 8 : 0),
            }
    const ctrl = {
      x: 50 + side * (40 + lift * 4),
      y: (shoulder.y + hand.y) / 2 - 4,
    }

    ctx.beginPath()
    ctx.moveTo(shoulder.x, shoulder.y)
    ctx.quadraticCurveTo(ctrl.x, ctrl.y, hand.x, hand.y)
    ctx.stroke()

    if (elated || waveArm) {
      for (let i = -1; i <= 1; i++) {
        const a = -Math.PI / 2 + i * 0.5 + (side < 0 ? -0.35 : 0.35)
        ctx.beginPath()
        ctx.moveTo(hand.x, hand.y)
        ctx.lineTo(hand.x + Math.cos(a) * 5.5, hand.y + Math.sin(a) * 5.5)
        ctx.stroke()
      }
    } else if (thumbArm) {
      ctx.beginPath()
      ctx.arc(hand.x, hand.y, 3.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(hand.x, hand.y - 2)
      ctx.lineTo(hand.x, hand.y - 9)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(hand.x, hand.y, 2.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawFace(ctx: CanvasRenderingContext2D, sim: MateSim, elated: boolean) {
  const eyeY = 45
  const eyeL = 36.5
  const eyeR = 63.5
  const look = sim.gaze * 2.6
  const smileEyes = sim.blinkFor > 0 || elated || sim.mood === "encourage"

  ctx.strokeStyle = NAVY
  ctx.lineWidth = 2.2
  ctx.lineCap = "round"

  if (smileEyes) {
    for (const x of [eyeL, eyeR]) {
      ctx.beginPath()
      ctx.moveTo(x - 7.5, eyeY + 2)
      ctx.quadraticCurveTo(x, eyeY - 6.5, x + 7.5, eyeY + 2)
      ctx.stroke()
    }
  } else {
    for (const x of [eyeL, eyeR]) {
      ctx.beginPath()
      ctx.ellipse(x, eyeY, 9.5, 10, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
      ctx.strokeStyle = NAVY
      ctx.lineWidth = 2.2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + look, eyeY + Math.abs(sim.gaze) * 1.2, 6, 0, Math.PI * 2)
      ctx.fillStyle = NAVY
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + look + 1.9, eyeY + Math.abs(sim.gaze) * 1.2 - 2.2, 1.9, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
    }
  }

  if (sim.mood === "talk" || sim.mood === "wave") {
    ctx.lineWidth = 3
    for (const side of [-1, 1]) {
      const x = 50 + side * 11
      ctx.beginPath()
      ctx.moveTo(x - side * 6, eyeY - 12)
      ctx.quadraticCurveTo(x, eyeY - 16, x + side * 6, eyeY - 11)
      ctx.stroke()
    }
  }

  const mouthY = 63
  ctx.lineWidth = 3.4
  ctx.strokeStyle = NAVY
  if (sim.mood === "talk") {
    const open = 4.5 + Math.abs(Math.sin(sim.talk * 14)) * 7.5
    drawOpenMouth(ctx, mouthY, open)
  } else if (sim.mood === "wave") {
    drawOpenMouth(ctx, mouthY, 7 + sim.reaction * 2)
  } else if (sim.mood === "idle") {
    ctx.beginPath()
    ctx.moveTo(42, mouthY - 1)
    ctx.quadraticCurveTo(50, mouthY + 7, 58, mouthY - 1)
    ctx.stroke()
  } else if (sim.mood === "think") {
    ctx.beginPath()
    ctx.moveTo(43 + look, mouthY + 1)
    ctx.lineTo(56 + look, mouthY - 2)
    ctx.stroke()
  } else if (sim.mood === "encourage") {
    ctx.beginPath()
    ctx.moveTo(42, mouthY)
    ctx.quadraticCurveTo(50, mouthY + 8, 58, mouthY)
    ctx.stroke()
  } else {
    drawOpenMouth(ctx, mouthY, 8 + sim.reaction * 3)
  }
}

function drawOpenMouth(ctx: CanvasRenderingContext2D, mouthY: number, open: number) {
  ctx.beginPath()
  ctx.moveTo(41, mouthY - 3)
  ctx.quadraticCurveTo(50, mouthY + open, 59, mouthY - 3)
  ctx.closePath()
  ctx.fillStyle = NAVY
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(50, mouthY + open * 0.72, 5.5, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = BELLY
  ctx.fill()
  ctx.restore()
}

function drawImpact(ctx: CanvasRenderingContext2D, sim: MateSim) {
  if (sim.impact <= 0.01) return
  ctx.strokeStyle = `rgba(30,58,138,${0.55 * sim.impact})`
  ctx.lineWidth = 2.4
  ctx.lineCap = "round"
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const spread = 4 + i * 5
      const y = 88 - i * 3.5
      ctx.beginPath()
      ctx.moveTo(50 + side * (22 + spread), y)
      ctx.lineTo(50 + side * (27 + spread + 4 * sim.impact), y - 2)
      ctx.stroke()
    }
  }
}

function drawSparks(ctx: CanvasRenderingContext2D, sim: MateSim, elated: boolean) {
  if (!elated && sim.mood !== "wave") return
  ctx.strokeStyle = YELLOW
  ctx.lineWidth = 3
  ctx.lineCap = "round"
  if (elated) {
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.42
      const r0 = 42 + sim.reaction * 6
      ctx.beginPath()
      ctx.moveTo(50 + r0 * Math.cos(a), 50 + r0 * Math.sin(a))
      ctx.lineTo(50 + (r0 + 9) * Math.cos(a), 50 + (r0 + 9) * Math.sin(a))
      ctx.stroke()
    }
  }
  if (sim.mood === "cheer") {
    star(ctx, 16, 26, 6.5 + sim.reaction * 1.5)
    star(ctx, 84, 30, 6.5 + sim.reaction * 1.5)
  }
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const outer = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const inner = outer + Math.PI / 5
    const ox = cx + r * Math.cos(outer)
    const oy = cy + r * Math.sin(outer)
    const ix = cx + r * 0.44 * Math.cos(inner)
    const iy = cy + r * 0.44 * Math.sin(inner)
    if (i === 0) ctx.moveTo(ox, oy)
    else ctx.lineTo(ox, oy)
    ctx.lineTo(ix, iy)
  }
  ctx.closePath()
  ctx.fillStyle = YELLOW
  ctx.fill()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}
