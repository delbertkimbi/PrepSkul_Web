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
