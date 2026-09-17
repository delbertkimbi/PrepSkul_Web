# SkulMate × Aristotle loop

Process log for matching [Aristotle](https://www.heyaristotle.com/) without becoming a chatbot or a cheatbot.

Audience: PrepSkul users sign up as **learner** or **parent**. In SkulMate both are the **student**. This is not Primar parent-voice cloning, and the tutor does not talk as if a parent is watching a child.

## What we studied (no signup yet)

Public site, research, and blog — not a live logged-in session.

| Aristotle claim | Source | SkulMate mapping |
| --- | --- | --- |
| Voice-first, interruptible | Home: “speaks out loud, listens live” | Hold-to-talk, barge-in on hold, auto-listen after the tutor speaks |
| Not a cheatbot | “never feeds you the answer” | `verifyTutorTurn` rejects answer dumps and fill-in-the-blank funneling |
| Focusing not funneling | [Funneling vs focusing](https://www.heyaristotle.com/blog/funneling-vs-focusing) | Policy moves: `focus` → `scaffold` → `instruct` only after 3 misses |
| Bridge: error → misconception → strategy | Chatbots-are-bad-tutors post | `diagnoseBridge` + `misconception` on the turn |
| Assistance ledger | Same post: don’t claim mastery after help | `assistance_ledger.independentDue` forces a transfer check |
| Whiteboard | Interactive board, diagrams, steps | `board` payload + in-thread `SkulMateTutorBoard` |
| Skill map / knowledge tracing | Granular skills + mastery | `skill_map` on `skulmate_learner_state` |
| Session memory + recap | Summaries, whiteboards, uploads | `skulmate_sessions.recap` + `/api/skulmate/session/recap` |
| Uploads | PDFs / images / textbooks | Existing ingest into the same thread |
| Parent dashboard | Aristotle treats parents as observers | **Not copied.** In SkulMate the parent is the student. Recap is for the signed-in person. |

Live product sits behind `https://app.heyaristotle.com/signin` (Google or email code). Marketing site has **no embedded demo video**.

`Destop/aristotle.mp4` was not in this workspace. Re-drop the file to have the session walked frame by frame.

## When to sign up

Do **not** sign up yet for this build — public pedagogy was enough to encode the loop.

**Sign up when** we need to walk a real Aristotle session: first-session onboarding, live duplex voice, their actual whiteboard strokes, and parent-email recap cadence. Use a throwaway account at `app.heyaristotle.com/onboard`.

## Turn protocol (shipped)

1. Student talks or drops notes.
2. Compiler packs identity (student), skill map, assistance ledger, retrieved notes.
3. Policy proposes `focus | scaffold | instruct | check | independent | reteach | escalate`.
4. Verifier rewrites funneling / answer dumps into a focusing question.
5. Board steps render in the thread. Practice surfaces only for `check` / `independent`.
6. If the tutor helped, `independentDue` stays true until a transfer check.
7. Recap updates: covered, stuck, next move, whether the student did the work.

## Migrations

- `106_skulmate_tutor_memory.sql` — sessions, turns, chunks, outcomes
- `107_skulmate_pedagogy.sql` — skill_map, assistance_ledger, recap, board
- `108_skulmate_retrieval.sql` — HNSW + `match_skulmate_chunks` RPC

## What we did not copy

- Aristotle’s parent-as-observer dashboard
- Caregiver voice / “your child” tutor talk
- Pricing, ESA, or teacher-classroom billing
- Full duplex WebRTC audio (next if the demo video or a live account shows we must)
