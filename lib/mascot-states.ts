/** Keep IDs stable: public/assets/mascot/manifest.json is the Rive handoff contract. */
export const mascotStates = ["idle", "happy", "wave", "thumbs_up", "thinking", "confused", "idea", "studying", "reading", "celebrate", "success", "try_again", "encourage", "sad", "sleeping", "running", "pointing", "teaching", "graduation", "calm"] as const
export type MascotState = typeof mascotStates[number]
export function mascotAsset(state: MascotState) {
  return `/assets/mascot/${state}.webp`
}
export const mascotLearningEvents = {
  answerCorrect: "success",
  answerIncorrect: "try_again",
  userStuck: "thinking",
  lessonStarted: "studying",
  lessonComplete: "celebrate",
  achievementEarned: "graduation",
  waiting: "idle",
} as const satisfies Record<string, MascotState>
