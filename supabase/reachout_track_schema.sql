-- Reachout Track: Customer service data collection for parent/student reachouts
-- All fields are required at application level; DB allows NULL for flexibility on optional follow-up fields.

CREATE TABLE IF NOT EXISTS reachout_track (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Agent/customer service info
  agent_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  -- Main fields
  customer_role TEXT NOT NULL CHECK (customer_role IN ('Parent', 'Student')),
  number_of_learners TEXT NOT NULL,
  learner_educational_level TEXT NOT NULL,
  subjects_of_interest TEXT NOT NULL,
  examination_status TEXT NOT NULL,
  session_type_preference TEXT NOT NULL CHECK (session_type_preference IN ('online', 'onsite')),
  frequency_of_sessions TEXT NOT NULL,
  start_date_time_preference TEXT NOT NULL,
  price_range TEXT NOT NULL,
  -- Follow-up section
  next_followup_at TIMESTAMP WITH TIME ZONE,
  followup_context TEXT NOT NULL,
  additional_info TEXT NOT NULL,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reachout_track_customer_whatsapp ON reachout_track(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_reachout_track_created_at ON reachout_track(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reachout_track_next_followup ON reachout_track(next_followup_at);

ALTER TABLE reachout_track ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert (customer service agents)
CREATE POLICY "Authenticated users can insert reachout records"
  ON reachout_track FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY "Authenticated users can view reachout records"
  ON reachout_track FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update (e.g. follow-up edits)
CREATE POLICY "Authenticated users can update reachout records"
  ON reachout_track FOR UPDATE
  TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS update_reachout_track_updated_at ON reachout_track;
DROP FUNCTION IF EXISTS update_reachout_track_updated_at();

CREATE OR REPLACE FUNCTION update_reachout_track_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reachout_track_updated_at
  BEFORE UPDATE ON reachout_track
  FOR EACH ROW
  EXECUTE FUNCTION update_reachout_track_updated_at();
