-- Aristotle-class pedagogy memory: skill map, assistance ledger, recaps, boards.
-- Learners and parents are both students in SkulMate.

ALTER TABLE public.skulmate_learner_state
  ADD COLUMN IF NOT EXISTS assistance_ledger JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.skulmate_learner_state
  ADD COLUMN IF NOT EXISTS skill_map JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.skulmate_sessions
  ADD COLUMN IF NOT EXISTS recap JSONB;

ALTER TABLE public.skulmate_turns
  ADD COLUMN IF NOT EXISTS board JSONB;

COMMENT ON COLUMN public.skulmate_learner_state.assistance_ledger IS
  'When SkulMate lightened load, independentDue stays true until a transfer check.';
COMMENT ON COLUMN public.skulmate_learner_state.skill_map IS
  'Granular skill mastery for the signed-in student (learner or parent).';
COMMENT ON COLUMN public.skulmate_sessions.recap IS
  'End-of-thread recap: covered, stuck, next independent check.';
COMMENT ON COLUMN public.skulmate_turns.board IS
  'In-thread whiteboard steps drawn for this tutor turn.';
