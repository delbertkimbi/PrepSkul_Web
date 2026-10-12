-- SkulMate tutor memory: sessions, turns, artifacts, embeddings, learner state, outcomes.
-- Audience: signed-up learners and parents are both students in SkulMate.
-- child_id is optional when a parent revises as a linked learner profile.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.skulmate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  account_role TEXT NOT NULL DEFAULT 'learner'
    CHECK (account_role IN ('learner', 'parent')),
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  last_turn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_sessions_user_recent
  ON public.skulmate_sessions (user_id, last_turn_at DESC);

CREATE TABLE IF NOT EXISTS public.skulmate_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.skulmate_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  text TEXT,
  audio_url TEXT,
  transcript TEXT,
  tool_name TEXT,
  tool_payload JSONB,
  token_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_turns_session
  ON public.skulmate_turns (session_id, created_at);

CREATE TABLE IF NOT EXISTS public.skulmate_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  session_id UUID REFERENCES public.skulmate_sessions(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  title TEXT,
  raw_text TEXT,
  file_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_artifacts_user
  ON public.skulmate_artifacts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.skulmate_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES public.skulmate_artifacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  content TEXT NOT NULL,
  concept_id TEXT,
  embedding vector(1536),
  token_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_chunks_user
  ON public.skulmate_chunks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skulmate_chunks_artifact
  ON public.skulmate_chunks (artifact_id);

CREATE TABLE IF NOT EXISTS public.skulmate_learner_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  language TEXT,
  class_level TEXT,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  learning_goals TEXT,
  weak_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_explanation_style TEXT,
  last_successful_move TEXT,
  summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_skulmate_learner_state_self
  ON public.skulmate_learner_state (user_id)
  WHERE child_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_skulmate_learner_state_child
  ON public.skulmate_learner_state (user_id, child_id)
  WHERE child_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.skulmate_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  session_id UUID REFERENCES public.skulmate_sessions(id) ON DELETE SET NULL,
  turn_id UUID REFERENCES public.skulmate_turns(id) ON DELETE SET NULL,
  concept_id TEXT,
  surface_type TEXT,
  correct BOOLEAN NOT NULL,
  hint_used BOOLEAN NOT NULL DEFAULT false,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_outcomes_user
  ON public.skulmate_outcomes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.skulmate_tutor_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id UUID,
  compiled_context JSONB,
  tool_calls JSONB,
  surface JSONB,
  outcome JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skulmate_tutor_traces_created
  ON public.skulmate_tutor_traces (created_at DESC);

ALTER TABLE public.skulmate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_learner_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulmate_tutor_traces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own skulmate sessions" ON public.skulmate_sessions;
CREATE POLICY "Users manage own skulmate sessions"
  ON public.skulmate_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own skulmate turns" ON public.skulmate_turns;
CREATE POLICY "Users manage own skulmate turns"
  ON public.skulmate_turns FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own skulmate artifacts" ON public.skulmate_artifacts;
CREATE POLICY "Users manage own skulmate artifacts"
  ON public.skulmate_artifacts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own skulmate chunks" ON public.skulmate_chunks;
CREATE POLICY "Users read own skulmate chunks"
  ON public.skulmate_chunks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own skulmate learner state" ON public.skulmate_learner_state;
CREATE POLICY "Users manage own skulmate learner state"
  ON public.skulmate_learner_state FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own skulmate outcomes" ON public.skulmate_outcomes;
CREATE POLICY "Users manage own skulmate outcomes"
  ON public.skulmate_outcomes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages skulmate tutor memory" ON public.skulmate_sessions;
CREATE POLICY "Service role manages skulmate tutor memory"
  ON public.skulmate_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate turns" ON public.skulmate_turns;
CREATE POLICY "Service role manages skulmate turns"
  ON public.skulmate_turns FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate artifacts" ON public.skulmate_artifacts;
CREATE POLICY "Service role manages skulmate artifacts"
  ON public.skulmate_artifacts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate chunks" ON public.skulmate_chunks;
CREATE POLICY "Service role manages skulmate chunks"
  ON public.skulmate_chunks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate learner state" ON public.skulmate_learner_state;
CREATE POLICY "Service role manages skulmate learner state"
  ON public.skulmate_learner_state FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate outcomes" ON public.skulmate_outcomes;
CREATE POLICY "Service role manages skulmate outcomes"
  ON public.skulmate_outcomes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages skulmate tutor traces" ON public.skulmate_tutor_traces;
CREATE POLICY "Service role manages skulmate tutor traces"
  ON public.skulmate_tutor_traces FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.skulmate_sessions IS
  'SkulMate tutor threads. Learners and parents are both students; child_id scopes a linked learner.';
COMMENT ON TABLE public.skulmate_outcomes IS
  'Every in-thread check. Written before the next tutor turn so retrieval can change.';

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

-- pgvector retrieval for SkulMate notes.
-- Replaces the JS "fetch 40 rows and cosine in process" path.
-- HNSW so inserts stay fast; 1536-d matches openai/text-embedding-3-small.

CREATE INDEX IF NOT EXISTS idx_skulmate_chunks_embedding_hnsw
  ON public.skulmate_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_skulmate_chunks(
  query_embedding vector(1536),
  match_user_id uuid,
  match_child_id uuid DEFAULT NULL,
  match_count int DEFAULT 6,
  match_threshold float DEFAULT 0.18
)
RETURNS TABLE (
  id uuid,
  artifact_id uuid,
  content text,
  concept_id text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.artifact_id,
    c.content,
    c.concept_id,
    (1 - (c.embedding <=> query_embedding))::float AS similarity
  FROM public.skulmate_chunks c
  WHERE c.user_id = match_user_id
    AND c.embedding IS NOT NULL
    AND (
      (match_child_id IS NULL AND c.child_id IS NULL)
      OR (match_child_id IS NOT NULL AND c.child_id = match_child_id)
    )
    AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 12));
$$;

GRANT EXECUTE ON FUNCTION public.match_skulmate_chunks(vector, uuid, uuid, int, float)
  TO service_role;

COMMENT ON FUNCTION public.match_skulmate_chunks IS
  'Top-k cosine match of a learner''s SkulMate chunks. Service role only.';

-- API owns writes; clients may only read their own learning records.
REVOKE ALL ON public.skulmate_sessions, public.skulmate_turns,
 public.skulmate_artifacts, public.skulmate_chunks, public.skulmate_learner_state,
 public.skulmate_outcomes, public.skulmate_tutor_traces FROM anon, authenticated;
GRANT SELECT ON public.skulmate_sessions, public.skulmate_turns,
 public.skulmate_artifacts, public.skulmate_chunks, public.skulmate_learner_state,
 public.skulmate_outcomes TO authenticated;
GRANT ALL ON public.skulmate_sessions, public.skulmate_turns,
 public.skulmate_artifacts, public.skulmate_chunks, public.skulmate_learner_state,
 public.skulmate_outcomes, public.skulmate_tutor_traces TO service_role;
REVOKE EXECUTE ON FUNCTION public.match_skulmate_chunks(vector,uuid,uuid,int,float) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.match_skulmate_chunks(vector,uuid,uuid,int,float) TO service_role;
ALTER FUNCTION public.match_skulmate_chunks(vector,uuid,uuid,int,float) SET search_path = pg_catalog,public,pg_temp;
